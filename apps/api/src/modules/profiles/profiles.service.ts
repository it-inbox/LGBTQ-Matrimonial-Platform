import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  CreateProfileInput,
  UpdateProfileInput,
  UpdatePrivacySettingsInput,
  Gender,
  Orientation,
  OutnessStatus,
  PhotoVisibility,
} from "@everpride/shared";

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) { }

  async getMyProfile(userId: string) {
    const profile = await this.prisma.client.profile.findUnique({
      where: { userId },
      include: {
        photos: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        partnerPreference: true,
      },
    });

    if (!profile) {
      throw new NotFoundException("Profile has not been created yet");
    }
    return profile;
  }

  async getProfileByUserId(targetUserId: string, currentUserId: string) {
    const profile = await this.prisma.client.profile.findFirst({
      where: {
        OR: [
          { userId: targetUserId },
          { id: targetUserId },
        ],
      },
      include: {
        photos: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        partnerPreference: true,
      },
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    // Always normalize targetUserId to the profile's underlying userId
    const canonicalTargetUserId = profile.userId;

    // Check if viewing own profile
    const isOwn = canonicalTargetUserId === currentUserId;

    // Check photo visibility permissions
    let canViewOriginal = isOwn || profile.photoVisibility === "ALL_MEMBERS";

    if (!canViewOriginal && profile.photoVisibility === "MUTUAL_MATCHES_ONLY") {
      const mutualInterest = await this.prisma.client.matchInterest.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: canonicalTargetUserId, status: "ACCEPTED" },
            { senderId: canonicalTargetUserId, receiverId: currentUserId, status: "ACCEPTED" },
          ],
        },
      });
      if (mutualInterest) {
        canViewOriginal = true;
      }
    }

    if (!canViewOriginal) {
      const photoGrant = await this.prisma.client.photoAccessRequest.findFirst({
        where: {
          requesterId: currentUserId,
          targetId: canonicalTargetUserId,
          status: "ACCEPTED",
          isHidden: false,
        },
      });
      if (photoGrant) {
        canViewOriginal = true;
      }
    }

    // Check current interaction status (sent/received interest, sent/received photo access request, block status)
    const [sentInterest, receivedInterest, sentPhotoRequest, receivedPhotoRequest, blockedByMe, blockedMe] = await Promise.all([
      this.prisma.client.matchInterest.findFirst({
        where: { senderId: currentUserId, receiverId: canonicalTargetUserId },
      }),
      this.prisma.client.matchInterest.findFirst({
        where: { senderId: canonicalTargetUserId, receiverId: currentUserId },
      }),
      this.prisma.client.photoAccessRequest.findFirst({
        where: { requesterId: currentUserId, targetId: canonicalTargetUserId },
      }),
      this.prisma.client.photoAccessRequest.findFirst({
        where: { requesterId: canonicalTargetUserId, targetId: currentUserId },
      }),
      this.prisma.client.blockedUser.findUnique({
        where: {
          userId_blockedId: {
            userId: currentUserId,
            blockedId: canonicalTargetUserId,
          },
        },
      }),
      this.prisma.client.blockedUser.findUnique({
        where: {
          userId_blockedId: {
            userId: canonicalTargetUserId,
            blockedId: currentUserId,
          },
        },
      }),
    ]);

    const isMutualMatch =
      (sentInterest?.status === "ACCEPTED" || receivedInterest?.status === "ACCEPTED");

    const sanitizedPhotos = profile.photos.map((p) => ({
      id: p.id,
      isPrimary: p.isPrimary,
      url: canViewOriginal ? p.originalUrl : (p.blurredUrl || p.originalUrl),
      originalUrl: canViewOriginal ? p.originalUrl : undefined,
      blurredUrl: p.blurredUrl || undefined,
      isBlurred: !canViewOriginal,
    }));

    return {
      ...profile,
      latitude: undefined,
      longitude: undefined,
      photos: sanitizedPhotos,
      interaction: {
        isOwn,
        isMutualMatch,
        isBlocked: !!(blockedByMe || blockedMe),
        isBlockedByMe: !!blockedByMe,
        hasBlockedMe: !!blockedMe,
        sentInterestStatus: sentInterest?.status || null,
        sentInterestId: sentInterest?.id || null,
        receivedInterestStatus: receivedInterest?.status || null,
        receivedInterestId: receivedInterest?.id || null,
        photoAccessStatus: sentPhotoRequest?.status || null,
        photoAccessId: sentPhotoRequest?.id || null,
        photoAccessIsHidden: sentPhotoRequest?.isHidden || false,
        photoAccessIsRevoked: sentPhotoRequest?.isRevoked || false,
        receivedPhotoAccessStatus: receivedPhotoRequest?.status || null,
        receivedPhotoAccessId: receivedPhotoRequest?.id || null,
        receivedPhotoAccessIsHidden: receivedPhotoRequest?.isHidden || false,
        receivedPhotoAccessIsRevoked: receivedPhotoRequest?.isRevoked || false,
      },
    };
  }

  async createProfile(userId: string, data: CreateProfileInput) {
    const existing = await this.prisma.client.profile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException("Profile already exists");
    }

    return this.prisma.client.profile.create({
      data: {
        userId,
        displayName: data.displayName,
        gender: data.gender as Gender,
        orientation: data.orientation as Orientation,
        pronouns: data.pronouns,
        outnessStatus: data.outnessStatus as OutnessStatus,
        dateOfBirth: new Date(data.dateOfBirth),
        heightCm: data.heightCm,
        nationality: data.nationality,
        religion: data.religion,
        motherTongue: data.motherTongue,
        languagesSpoken: data.languagesSpoken || [],
        maritalStatus: data.maritalStatus,
        phoneNumber: data.phoneNumber,
        phoneVerified: data.phoneVerified ?? false,
        backupEmail: data.backupEmail,
        city: data.city,
        state: data.state,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        education: data.education,
        degree: data.degree,
        sector: data.sector,
        profession: data.profession,
        company: data.company,
        annualIncome: data.annualIncome,
        bio: data.bio,
        diet: data.diet,
        drinking: data.drinking,
        smoking: data.smoking,
        pets: data.pets,
        hobbies: data.hobbies || [],
        photoVisibility: data.photoVisibility as PhotoVisibility,
        ghostModeEnabled: data.ghostModeEnabled,
        ...(data.photos && data.photos.length > 0 && {
          photos: {
            create: data.photos.map((url, idx) => ({
              originalUrl: url,
              isPrimary: idx === 0,
            })),
          },
        }),
        ...(data.partnerPreference && {
          partnerPreference: {
            create: {
              preferredGenders: data.partnerPreference.preferredGenders as Gender[],
              preferredOrientations: data.partnerPreference.preferredOrientations as Orientation[],
              minAge: data.partnerPreference.minAge,
              maxAge: data.partnerPreference.maxAge,
              minHeightCm: data.partnerPreference.minHeightCm,
              maxHeightCm: data.partnerPreference.maxHeightCm,
              maxDistanceKm: data.partnerPreference.maxDistanceKm,
              acceptableOutness: data.partnerPreference.acceptableOutness as OutnessStatus[],
            },
          },
        }),
      },
      include: {
        photos: true,
        partnerPreference: true,
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const profile = await this.prisma.client.profile.findUnique({
      where: { userId },
      include: { partnerPreference: true },
    });
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    const { dateOfBirth, gender, orientation, outnessStatus, photoVisibility, partnerPreference, photos, ...rest } = data;

    // If photos are provided, replace existing photos with the updated photo list
    if (photos && Array.isArray(photos)) {
      await this.prisma.client.profilePhoto.deleteMany({
        where: { profileId: profile.id },
      });

      if (photos.length > 0) {
        await this.prisma.client.profilePhoto.createMany({
          data: photos.map((url, idx) => ({
            profileId: profile.id,
            originalUrl: url,
            isPrimary: idx === 0,
            isApproved: true,
          })),
        });
      }
    }

    return this.prisma.client.profile.update({
      where: { userId },
      data: {
        ...rest,
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender: gender as Gender }),
        ...(orientation && { orientation: orientation as Orientation }),
        ...(outnessStatus && { outnessStatus: outnessStatus as OutnessStatus }),
        ...(photoVisibility && { photoVisibility: photoVisibility as PhotoVisibility }),
        ...(partnerPreference && {
          partnerPreference: {
            upsert: {
              create: {
                preferredGenders: (partnerPreference.preferredGenders || []) as Gender[],
                preferredOrientations: (partnerPreference.preferredOrientations || []) as Orientation[],
                minAge: partnerPreference.minAge ?? 21,
                maxAge: partnerPreference.maxAge ?? 50,
                minHeightCm: partnerPreference.minHeightCm,
                maxHeightCm: partnerPreference.maxHeightCm,
                maxDistanceKm: partnerPreference.maxDistanceKm,
                acceptableOutness: (partnerPreference.acceptableOutness || []) as OutnessStatus[],
              },
              update: {
                ...(partnerPreference.preferredGenders && {
                  preferredGenders: partnerPreference.preferredGenders as Gender[],
                }),
                ...(partnerPreference.preferredOrientations && {
                  preferredOrientations: partnerPreference.preferredOrientations as Orientation[],
                }),
                ...(partnerPreference.minAge !== undefined && { minAge: partnerPreference.minAge }),
                ...(partnerPreference.maxAge !== undefined && { maxAge: partnerPreference.maxAge }),
                ...(partnerPreference.minHeightCm !== undefined && { minHeightCm: partnerPreference.minHeightCm }),
                ...(partnerPreference.maxHeightCm !== undefined && { maxHeightCm: partnerPreference.maxHeightCm }),
                ...(partnerPreference.maxDistanceKm !== undefined && { maxDistanceKm: partnerPreference.maxDistanceKm }),
                ...(partnerPreference.acceptableOutness && {
                  acceptableOutness: partnerPreference.acceptableOutness as OutnessStatus[],
                }),
              },
            },
          },
        }),
      },
      include: {
        photos: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        partnerPreference: true,
      },
    });
  }

  async updatePrivacy(userId: string, data: UpdatePrivacySettingsInput) {
    return this.prisma.client.profile.update({
      where: { userId },
      data: {
        ...(data.photoVisibility && { photoVisibility: data.photoVisibility as PhotoVisibility }),
        ...(data.ghostModeEnabled !== undefined && { ghostModeEnabled: data.ghostModeEnabled }),
      },
      select: {
        photoVisibility: true,
        ghostModeEnabled: true,
      },
    });
  }
}
