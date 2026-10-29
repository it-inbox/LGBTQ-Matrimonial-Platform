import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  SendInterestInput,
  RespondInterestInput,
  RequestPhotoAccessInput,
} from "@everpride/shared";

import { ChatGateway } from "../chat/chat.gateway.js";

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) { }

  /**
   * Centralized sanitizer that enforces progressive photo disclosure and safeguards privacy.
   * Original photo URLs are only returned if:
   * 1. The photo visibility is set to ALL_MEMBERS, OR
   * 2. The viewer has an ACCEPTED photo unblur grant, OR
   * 3. The viewer and target have a mutual match (isMutualMatch is true).
   * Otherwise, originalUrl is strictly omitted / set to blurredUrl.
   */
  private sanitizePhotos(
    photos: Array<{ id: string; isPrimary: boolean; originalUrl: string; blurredUrl?: string | null }>,
    canViewOriginal: boolean
  ) {
    return photos.map((photo) => ({
      id: photo.id,
      isPrimary: photo.isPrimary,
      url: canViewOriginal ? photo.originalUrl : (photo.blurredUrl || ""),
      originalUrl: canViewOriginal ? photo.originalUrl : undefined,
      blurredUrl: photo.blurredUrl || undefined,
      isBlurred: !canViewOriginal,
    }));
  }

  async getFeed(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      nationalities?: string[];
      religions?: string[];
      maritalStatuses?: string[];
      minAge?: number;
      maxAge?: number;
      quickFilter?: string;
    } = {}
  ) {
    const pageNum = Math.max(1, Number(options.page) || 1);
    const take = Math.min(50, Math.max(1, Number(options.limit) || 20));
    const skip = (pageNum - 1) * take;

    // 1. Get current user profile and preferences
    const userProfile = await this.prisma.client.profile.findUnique({
      where: { userId },
      include: { partnerPreference: true },
    });

    if (!userProfile) {
      throw new BadRequestException("Please complete your profile before browsing matches");
    }

    // 2. Fetch exclusions (blocked users + already interacted users)
    const [blocked, existingInterests] = await Promise.all([
      this.prisma.client.blockedUser.findMany({
        where: {
          OR: [{ userId }, { blockedId: userId }],
        },
        select: { userId: true, blockedId: true },
      }),
      this.prisma.client.matchInterest.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId, status: "ACCEPTED" },
          ],
        },
        select: { senderId: true, receiverId: true },
      }),
    ]);

    const excludedUserIds = new Set<string>([
      userId,
      ...blocked.map((b) => (b.userId === userId ? b.blockedId : b.userId)),
      ...existingInterests.map((i) => (i.senderId === userId ? i.receiverId : i.senderId)),
    ]);

    // 3. Build comprehensive database WHERE clause
    const whereClause: any = {
      userId: { notIn: Array.from(excludedUserIds) },
    };

    // Preference filters
    if (userProfile.partnerPreference?.preferredGenders?.length) {
      whereClause.gender = { in: userProfile.partnerPreference.preferredGenders };
    }
    if (userProfile.partnerPreference?.preferredOrientations?.length) {
      whereClause.orientation = { in: userProfile.partnerPreference.preferredOrientations };
    }

    // Server-side Multi-Select Filters
    if (options.nationalities && options.nationalities.length > 0) {
      whereClause.nationality = { in: options.nationalities };
    }
    if (options.religions && options.religions.length > 0) {
      whereClause.religion = { in: options.religions };
    }
    if (options.maritalStatuses && options.maritalStatuses.length > 0) {
      whereClause.maritalStatus = { in: options.maritalStatuses };
    }

    // Age Filter (converted to Date of Birth ranges)
    const now = new Date();
    if (options.minAge !== undefined || options.maxAge !== undefined) {
      const minAge = options.minAge || 18;
      const maxAge = options.maxAge || 80;
      const maxDob = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
      const minDob = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate());

      whereClause.dateOfBirth = {
        gte: minDob,
        lte: maxDob,
      };
    }

    // Search Query (Indexed text search across names, city, state, country, nationality, religion, profession)
    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      whereClause.OR = [
        { displayName: { contains: term, mode: "insensitive" } },
        { city: { contains: term, mode: "insensitive" } },
        { state: { contains: term, mode: "insensitive" } },
        { country: { contains: term, mode: "insensitive" } },
        { nationality: { contains: term, mode: "insensitive" } },
        { religion: { contains: term, mode: "insensitive" } },
        { profession: { contains: term, mode: "insensitive" } },
      ];
    }

    // Quick Filters
    if (options.quickFilter === "With Photos") {
      whereClause.photoVisibility = "ALL_MEMBERS";
    } else if (options.quickFilter === "Nearby" && userProfile.city) {
      whereClause.city = { equals: userProfile.city, mode: "insensitive" };
    }

    // 4. Smart Scoring & Rotation Ordering
    // Proximity to viewer's country/state first, followed by recent activity
    const orderByClause: any[] = [];
    if (options.quickFilter === "Nearby" && userProfile.state) {
      orderByClause.push({ state: "asc" });
    }
    orderByClause.push({ updatedAt: "desc" });

    // 5. Query profiles with pagination
    const [totalCount, profiles] = await Promise.all([
      this.prisma.client.profile.count({ where: whereClause }),
      this.prisma.client.profile.findMany({
        where: whereClause,
        include: {
          photos: {
            select: {
              id: true,
              isPrimary: true,
              blurredUrl: true,
              originalUrl: true,
            },
          },
        },
        skip,
        take,
        orderBy: orderByClause,
      }),
    ]);

    // 6. Check photo access permissions for masked photos
    const photoGrants = await this.prisma.client.photoAccessRequest.findMany({
      where: {
        requesterId: userId,
        status: "ACCEPTED",
        isHidden: false,
      },
      select: { targetId: true },
    });
    const grantedTargetIds = new Set(photoGrants.map((g) => g.targetId));

    // 7. Sanitize coordinates and photos
    const sanitizedProfiles = profiles.map((p) => {
      const canViewOriginal =
        p.photoVisibility === "ALL_MEMBERS" || grantedTargetIds.has(p.userId);

      return {
        ...p,
        latitude: undefined, // Obfuscate exact coordinates
        longitude: undefined,
        photos: this.sanitizePhotos(p.photos, canViewOriginal),
      };
    });

    return {
      data: sanitizedProfiles,
      pagination: {
        page: pageNum,
        limit: take,
        total: totalCount,
        hasMore: skip + profiles.length < totalCount,
      },
    };
  }

  async sendInterest(senderId: string, data: SendInterestInput) {
    if (senderId === data.targetUserId) {
      throw new BadRequestException("You cannot send interest to yourself");
    }

    // 1. Check if the target user has ALREADY sent an interest to us
    const reverseInterest = await this.prisma.client.matchInterest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: data.targetUserId,
          receiverId: senderId,
        },
      },
    });

    // If reverse interest exists and is pending, automatically accept both as a MUTUAL MATCH!
    if (reverseInterest) {
      const [updatedReverse, myInterest] = await this.prisma.client.$transaction([
        this.prisma.client.matchInterest.update({
          where: { id: reverseInterest.id },
          data: { status: "ACCEPTED" },
        }),
        this.prisma.client.matchInterest.upsert({
          where: {
            senderId_receiverId: {
              senderId,
              receiverId: data.targetUserId,
            },
          },
          update: {
            status: "ACCEPTED",
            message: data.message,
          },
          create: {
            senderId,
            receiverId: data.targetUserId,
            status: "ACCEPTED",
            message: data.message,
          },
        }),
      ]);

      // Auto-create mutual conversation
      const p1 = senderId < data.targetUserId ? senderId : data.targetUserId;
      const p2 = senderId < data.targetUserId ? data.targetUserId : senderId;
      await this.prisma.client.conversation.upsert({
        where: {
          participant1Id_participant2Id: {
            participant1Id: p1,
            participant2Id: p2,
          },
        },
        update: {},
        create: {
          participant1Id: p1,
          participant2Id: p2,
        },
      });

      // Fetch sender & partner profiles for real-time notification
      const [senderUser, targetUser] = await Promise.all([
        this.prisma.client.user.findUnique({
          where: { id: senderId },
          include: { profile: { include: { photos: { where: { isPrimary: true } } } } },
        }),
        this.prisma.client.user.findUnique({
          where: { id: data.targetUserId },
          include: { profile: { include: { photos: { where: { isPrimary: true } } } } },
        }),
      ]);

      const senderPhoto = senderUser?.profile?.photos?.[0];
      const targetPhoto = targetUser?.profile?.photos?.[0];

      // Emit new_match notification to BOTH users
      this.chatGateway.emitToUser(data.targetUserId, "new_match", {
        matchId: myInterest.id,
        user: {
          id: senderId,
          displayName: senderUser?.profile?.displayName || "Member",
          avatarUrl: senderPhoto?.originalUrl || senderPhoto?.blurredUrl || null,
        },
      });

      this.chatGateway.emitToUser(senderId, "new_match", {
        matchId: myInterest.id,
        user: {
          id: data.targetUserId,
          displayName: targetUser?.profile?.displayName || "Member",
          avatarUrl: targetPhoto?.originalUrl || targetPhoto?.blurredUrl || null,
        },
      });

      return myInterest;
    }

    // Normal interest submission (Pending)
    const newInterest = await this.prisma.client.matchInterest.upsert({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId: data.targetUserId,
        },
      },
      update: {
        status: "PENDING",
        message: data.message,
      },
      create: {
        senderId,
        receiverId: data.targetUserId,
        message: data.message,
      },
    });

    // Notify receiver about new received interest
    const senderUser = await this.prisma.client.user.findUnique({
      where: { id: senderId },
      include: { profile: { include: { photos: { where: { isPrimary: true } } } } },
    });
    const senderPhoto = senderUser?.profile?.photos?.[0];

    this.chatGateway.emitToUser(data.targetUserId, "new_interest", {
      interestId: newInterest.id,
      user: {
        id: senderId,
        displayName: senderUser?.profile?.displayName || "Member",
        avatarUrl: senderPhoto?.originalUrl || senderPhoto?.blurredUrl || null,
      },
      message: data.message || "Sent you an interest request",
    });

    return newInterest;
  }

  async respondInterest(receiverId: string, interestId: string, data: RespondInterestInput) {
    const interest = await this.prisma.client.matchInterest.findUnique({
      where: { id: interestId },
    });
    if (!interest || interest.receiverId !== receiverId) {
      throw new NotFoundException("Interest request not found");
    }

    const updated = await this.prisma.client.matchInterest.update({
      where: { id: interestId },
      data: { status: data.status },
    });

    // Auto-create conversation & notify sender if interest accepted
    if (data.status === "ACCEPTED") {
      const p1 = interest.senderId < receiverId ? interest.senderId : receiverId;
      const p2 = interest.senderId < receiverId ? receiverId : interest.senderId;

      await this.prisma.client.conversation.upsert({
        where: {
          participant1Id_participant2Id: {
            participant1Id: p1,
            participant2Id: p2,
          },
        },
        update: {},
        create: {
          participant1Id: p1,
          participant2Id: p2,
        },
      });

      // Notify interest sender that their interest was ACCEPTED
      const receiverUser = await this.prisma.client.user.findUnique({
        where: { id: receiverId },
        include: { profile: { include: { photos: { where: { isPrimary: true } } } } },
      });
      const receiverPhoto = receiverUser?.profile?.photos?.[0];

      this.chatGateway.emitToUser(interest.senderId, "interest_accepted", {
        interestId,
        user: {
          id: receiverId,
          displayName: receiverUser?.profile?.displayName || "Member",
          avatarUrl: receiverPhoto?.originalUrl || receiverPhoto?.blurredUrl || null,
        },
      });

      // Also trigger new_match for the sender
      this.chatGateway.emitToUser(interest.senderId, "new_match", {
        matchId: interestId,
        user: {
          id: receiverId,
          displayName: receiverUser?.profile?.displayName || "Member",
          avatarUrl: receiverPhoto?.originalUrl || receiverPhoto?.blurredUrl || null,
        },
      });
    }

    return updated;
  }

  async requestPhotoAccess(requesterId: string, data: RequestPhotoAccessInput) {
    return this.prisma.client.photoAccessRequest.upsert({
      where: {
        requesterId_targetId: {
          requesterId,
          targetId: data.targetUserId,
        },
      },
      update: {
        status: "PENDING",
        isRevoked: false,
        isHidden: false,
      },
      create: {
        requesterId,
        targetId: data.targetUserId,
        isRevoked: false,
        isHidden: false,
      },
    });
  }

  async getReceivedInterests(userId: string) {
    const [interests, photoGrants] = await Promise.all([
      this.prisma.client.matchInterest.findMany({
        where: { receiverId: userId },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              profile: {
                select: {
                  id: true,
                  userId: true,
                  displayName: true,
                  gender: true,
                  orientation: true,
                  dateOfBirth: true,
                  heightCm: true,
                  profession: true,
                  education: true,
                  degree: true,
                  sector: true,
                  maritalStatus: true,
                  city: true,
                  state: true,
                  country: true,
                  religion: true,
                  annualIncome: true,
                  pronouns: true,
                  photoVisibility: true,
                  photos: {
                    select: {
                      id: true,
                      isPrimary: true,
                      originalUrl: true,
                      blurredUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.client.photoAccessRequest.findMany({
        where: { requesterId: userId, status: "ACCEPTED", isHidden: false },
        select: { targetId: true },
      }),
    ]);

    const grantedTargetIds = new Set(photoGrants.map((g) => g.targetId));

    return interests.map((item) => {
      if (!item.sender?.profile) return item;
      const isMutualAccepted = item.status === "ACCEPTED";
      const canView =
        item.sender.profile.photoVisibility === "ALL_MEMBERS" ||
        isMutualAccepted ||
        grantedTargetIds.has(item.sender.id);

      return {
        ...item,
        sender: {
          ...item.sender,
          profile: {
            ...item.sender.profile,
            photos: this.sanitizePhotos(item.sender.profile.photos, canView),
          },
        },
      };
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Unblur / Photo Access Methods
  // ─────────────────────────────────────────────────────────────

  async getReceivedPhotoRequests(userId: string) {
    const requests = await this.prisma.client.photoAccessRequest.findMany({
      where: {
        targetId: userId,
      },
      include: {
        requester: {
          select: {
            id: true,
            phoneNumber: true,
            profile: {
              select: {
                id: true,
                userId: true,
                displayName: true,
                gender: true,
                orientation: true,
                city: true,
                state: true,
                profession: true,
                education: true,
                dateOfBirth: true,
                heightCm: true,
                religion: true,
                annualIncome: true,
                maritalStatus: true,
                pronouns: true,
                photoVisibility: true,
                photos: {
                  select: {
                    id: true,
                    isPrimary: true,
                    originalUrl: true,
                    blurredUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const photoGrants = await this.prisma.client.photoAccessRequest.findMany({
      where: { requesterId: userId, status: "ACCEPTED", isHidden: false },
      select: { targetId: true },
    });
    const grantedIds = new Set(photoGrants.map((g) => g.targetId));

    return requests.map((req) => {
      if (!req.requester?.profile) return req;
      const canView =
        req.requester.profile.photoVisibility === "ALL_MEMBERS" ||
        (req.status === "ACCEPTED" && !req.isHidden) ||
        grantedIds.has(req.requester.id);

      return {
        ...req,
        requester: {
          ...req.requester,
          profile: {
            ...req.requester.profile,
            photos: this.sanitizePhotos(req.requester.profile.photos, canView),
          },
        },
      };
    });
  }

  async getSentPhotoRequests(userId: string) {
    const requests = await this.prisma.client.photoAccessRequest.findMany({
      where: {
        requesterId: userId,
      },
      include: {
        target: {
          select: {
            id: true,
            phoneNumber: true,
            profile: {
              select: {
                id: true,
                userId: true,
                displayName: true,
                gender: true,
                orientation: true,
                city: true,
                state: true,
                profession: true,
                education: true,
                dateOfBirth: true,
                heightCm: true,
                religion: true,
                annualIncome: true,
                maritalStatus: true,
                pronouns: true,
                photoVisibility: true,
                photos: {
                  select: {
                    id: true,
                    isPrimary: true,
                    originalUrl: true,
                    blurredUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((req) => {
      if (!req.target?.profile) return req;
      const canView =
        req.target.profile.photoVisibility === "ALL_MEMBERS" ||
        (req.status === "ACCEPTED" && !req.isHidden);

      return {
        ...req,
        target: {
          ...req.target,
          profile: {
            ...req.target.profile,
            photos: this.sanitizePhotos(req.target.profile.photos, canView),
          },
        },
      };
    });
  }

  async getIAcceptedPhotoRequests(userId: string) {
    return this.getReceivedPhotoRequests(userId).then((reqs) =>
      reqs.filter((r) => r.status === "ACCEPTED")
    );
  }

  async getTheyAcceptedPhotoRequests(userId: string) {
    return this.getSentPhotoRequests(userId).then((reqs) =>
      reqs.filter((r) => r.status === "ACCEPTED")
    );
  }

  async getIDeclinedPhotoRequests(userId: string) {
    return this.getReceivedPhotoRequests(userId).then((reqs) =>
      reqs.filter((r) => r.status === "DECLINED")
    );
  }

  async getTheyDeclinedPhotoRequests(userId: string) {
    return this.getSentPhotoRequests(userId).then((reqs) =>
      reqs.filter((r) => r.status === "DECLINED")
    );
  }

  async respondPhotoAccess(targetId: string, requestId: string, data: RespondInterestInput) {
    const request = await this.prisma.client.photoAccessRequest.findUnique({
      where: { id: requestId },
    });
    if (!request || request.targetId !== targetId) {
      throw new NotFoundException("Photo access request not found");
    }

    return this.prisma.client.photoAccessRequest.update({
      where: { id: requestId },
      data: {
        status: data.status,
        isRevoked: false,
      },
    });
  }

  async toggleHidePhotoAccess(targetId: string, requestId: string, isHidden?: boolean) {
    const request = await this.prisma.client.photoAccessRequest.findUnique({
      where: { id: requestId },
    });
    if (!request || request.targetId !== targetId) {
      throw new NotFoundException("Photo access request not found");
    }

    const nextHidden = isHidden !== undefined ? isHidden : !request.isHidden;

    return this.prisma.client.photoAccessRequest.update({
      where: { id: requestId },
      data: { isHidden: nextHidden },
    });
  }

  async revokePhotoAccess(targetId: string, requestId: string) {
    const request = await this.prisma.client.photoAccessRequest.findUnique({
      where: { id: requestId },
    });
    if (!request || request.targetId !== targetId) {
      throw new NotFoundException("Photo access request not found");
    }

    // Completely revoke access (set to DECLINED with isRevoked: true and reset isHidden)
    // Requester will need to send a new request if they want to ask for unblur again
    return this.prisma.client.photoAccessRequest.update({
      where: { id: requestId },
      data: {
        status: "DECLINED",
        isHidden: false,
        isRevoked: true,
      },
    });
  }


  async getSentInterests(userId: string) {
    const [interests, photoGrants] = await Promise.all([
      this.prisma.client.matchInterest.findMany({
        where: {
          senderId: userId,
        },
        include: {
          receiver: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  id: true,
                  userId: true,
                  displayName: true,
                  gender: true,
                  orientation: true,
                  dateOfBirth: true,
                  heightCm: true,
                  profession: true,
                  education: true,
                  degree: true,
                  sector: true,
                  maritalStatus: true,
                  city: true,
                  state: true,
                  country: true,
                  religion: true,
                  annualIncome: true,
                  pronouns: true,
                  photoVisibility: true,
                  photos: {
                    select: {
                      id: true,
                      isPrimary: true,
                      originalUrl: true,
                      blurredUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.client.photoAccessRequest.findMany({
        where: { requesterId: userId, status: "ACCEPTED", isHidden: false },
        select: { targetId: true },
      }),
    ]);

    const grantedIds = new Set(photoGrants.map((g) => g.targetId));

    return interests.map((item) => {
      if (!item.receiver?.profile) return item;
      const isMutualAccepted = item.status === "ACCEPTED";
      const canView =
        item.receiver.profile.photoVisibility === "ALL_MEMBERS" ||
        isMutualAccepted ||
        grantedIds.has(item.receiver.id);

      return {
        ...item,
        receiver: {
          ...item.receiver,
          profile: {
            ...item.receiver.profile,
            photos: this.sanitizePhotos(item.receiver.profile.photos, canView),
          },
        },
      };
    });
  }

  async getDeclinedInterests(userId: string) {
    // Interests where I received them and I declined (I Declined)
    return this.prisma.client.matchInterest.findMany({
      where: {
        receiverId: userId,
        status: "DECLINED",
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                userId: true,
                displayName: true,
                gender: true,
                orientation: true,
                dateOfBirth: true,
                heightCm: true,
                profession: true,
                education: true,
                degree: true,
                sector: true,
                maritalStatus: true,
                city: true,
                state: true,
                country: true,
                religion: true,
                photos: {
                  select: {
                    id: true,
                    isPrimary: true,
                    originalUrl: true,
                    blurredUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getTheyDeclinedInterests(userId: string) {
    // Interests where I sent them and they declined (They Declined)
    return this.prisma.client.matchInterest.findMany({
      where: {
        senderId: userId,
        status: "DECLINED",
      },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                userId: true,
                displayName: true,
                gender: true,
                orientation: true,
                dateOfBirth: true,
                heightCm: true,
                profession: true,
                education: true,
                degree: true,
                sector: true,
                maritalStatus: true,
                city: true,
                state: true,
                country: true,
                religion: true,
                photos: {
                  select: {
                    id: true,
                    isPrimary: true,
                    originalUrl: true,
                    blurredUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getAcceptedMatches(userId: string) {
    // 0. Query blocked accounts for current user (both directions)
    const blockedList = await this.prisma.client.blockedUser.findMany({
      where: {
        OR: [{ userId }, { blockedId: userId }],
      },
    });

    const blockedByMeSet = new Set(
      blockedList.filter((b) => b.userId === userId).map((b) => b.blockedId)
    );
    const blockedMeSet = new Set(
      blockedList.filter((b) => b.blockedId === userId).map((b) => b.userId)
    );

    // 1. Interests sent by me that got ACCEPTED
    const sentAccepted = await this.prisma.client.matchInterest.findMany({
      where: {
        senderId: userId,
        status: "ACCEPTED",
      },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            profile: {
              select: {
                id: true,
                userId: true,
                displayName: true,
                gender: true,
                orientation: true,
                dateOfBirth: true,
                heightCm: true,
                profession: true,
                education: true,
                degree: true,
                sector: true,
                maritalStatus: true,
                city: true,
                state: true,
                country: true,
                religion: true,
                annualIncome: true,
                pronouns: true,
                photos: {
                  select: {
                    id: true,
                    isPrimary: true,
                    originalUrl: true,
                    blurredUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2. Interests received by me that I ACCEPTED
    const receivedAccepted = await this.prisma.client.matchInterest.findMany({
      where: {
        receiverId: userId,
        status: "ACCEPTED",
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            profile: {
              select: {
                id: true,
                userId: true,
                displayName: true,
                gender: true,
                orientation: true,
                dateOfBirth: true,
                heightCm: true,
                profession: true,
                education: true,
                degree: true,
                sector: true,
                maritalStatus: true,
                city: true,
                state: true,
                country: true,
                religion: true,
                annualIncome: true,
                pronouns: true,
                photos: {
                  select: {
                    id: true,
                    isPrimary: true,
                    originalUrl: true,
                    blurredUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Map each into a unified MutualMatch item with sanitized photos (mutual matches are allowed original view)
    const formattedSent = sentAccepted.map((item) => {
      const partnerId = item.receiver?.id;
      const isBlockedByMe = partnerId ? blockedByMeSet.has(partnerId) : false;
      const hasBlockedMe = partnerId ? blockedMeSet.has(partnerId) : false;
      return {
        interestId: item.id,
        matchType: "ACCEPTED_BY_THEM" as const,
        matchedAt: item.updatedAt,
        message: item.message,
        isBlocked: isBlockedByMe || hasBlockedMe,
        isBlockedByMe,
        hasBlockedMe,
        user: {
          ...item.receiver,
          profile: item.receiver?.profile
            ? {
                ...item.receiver.profile,
                photos: this.sanitizePhotos(item.receiver.profile.photos, true),
              }
            : undefined,
        },
      };
    });

    const formattedReceived = receivedAccepted.map((item) => {
      const partnerId = item.sender?.id;
      const isBlockedByMe = partnerId ? blockedByMeSet.has(partnerId) : false;
      const hasBlockedMe = partnerId ? blockedMeSet.has(partnerId) : false;
      return {
        interestId: item.id,
        matchType: "ACCEPTED_BY_ME" as const,
        matchedAt: item.updatedAt,
        message: item.message,
        isBlocked: isBlockedByMe || hasBlockedMe,
        isBlockedByMe,
        hasBlockedMe,
        user: {
          ...item.sender,
          profile: item.sender?.profile
            ? {
                ...item.sender.profile,
                photos: this.sanitizePhotos(item.sender.profile.photos, true),
              }
            : undefined,
        },
      };
    });

    const combined = [...formattedSent, ...formattedReceived].sort(
      (a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime()
    );

    // Deduplicate by partner user id so mutual reciprocal matches don't appear twice
    const seenMatchUserIds = new Set<string>();
    const deduplicated: typeof combined = [];
    for (const match of combined) {
      if (match.user?.id && !seenMatchUserIds.has(match.user.id)) {
        seenMatchUserIds.add(match.user.id);
        deduplicated.push(match);
      }
    }

    return deduplicated;
  }

  /**
   * Block a user
   */
  async blockUser(userId: string, targetUserId: string, reason?: string) {
    if (userId === targetUserId) {
      throw new BadRequestException("You cannot block yourself");
    }

    // Verify target exists
    const targetUser = await this.prisma.client.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });
    if (!targetUser) {
      throw new NotFoundException("Target user not found");
    }

    const blocked = await this.prisma.client.blockedUser.upsert({
      where: {
        userId_blockedId: {
          userId,
          blockedId: targetUserId,
        },
      },
      create: {
        userId,
        blockedId: targetUserId,
        reason: reason || "User blocked via safety controls",
      },
      update: {
        reason: reason || "User blocked via safety controls",
      },
    });

    return {
      success: true,
      message: "User successfully blocked",
      blocked,
    };
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException("You cannot unblock yourself");
    }

    const existing = await this.prisma.client.blockedUser.findUnique({
      where: {
        userId_blockedId: {
          userId,
          blockedId: targetUserId,
        },
      },
    });

    if (!existing) {
      return {
        success: true,
        message: "User is not currently blocked",
      };
    }

    await this.prisma.client.blockedUser.delete({
      where: {
        userId_blockedId: {
          userId,
          blockedId: targetUserId,
        },
      },
    });

    return {
      success: true,
      message: "User successfully unblocked",
    };
  }

  /**
   * Get list of users blocked by the current user
   */
  async getBlockedUsers(userId: string) {
    const blockedList = await this.prisma.client.blockedUser.findMany({
      where: { userId },
      include: {
        blocked: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            profile: {
              select: {
                id: true,
                displayName: true,
                city: true,
                state: true,
                profession: true,
                gender: true,
                photos: {
                  select: {
                    id: true,
                    isPrimary: true,
                    originalUrl: true,
                    blurredUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return blockedList.map((item) => {
      const primaryPhoto = item.blocked.profile?.photos?.find((p) => p.isPrimary) || item.blocked.profile?.photos?.[0];
      return {
        id: item.id,
        blockedUserId: item.blockedId,
        reason: item.reason,
        createdAt: item.createdAt,
        user: {
          id: item.blocked.id,
          displayName: item.blocked.profile?.displayName || "Member",
          city: item.blocked.profile?.city,
          state: item.blocked.profile?.state,
          profession: item.blocked.profile?.profession,
          avatarUrl: primaryPhoto ? (primaryPhoto.blurredUrl || primaryPhoto.originalUrl) : null,
        },
      };
    });
  }
}
