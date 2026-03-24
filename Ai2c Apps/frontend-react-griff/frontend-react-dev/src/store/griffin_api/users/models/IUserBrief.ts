import dayjs from 'dayjs';

/**
 * Represents an shortened application user object returned from the backend
 */
export interface IUserBriefDto {
  user_id: string;
  rank: string;
  first_name: string;
  last_name: string;
  email?: string;
  last_activity?: string;
}

/**
 * Represents a shortened user object.
 */
export interface IUserBrief {
  userId: string;
  firstName: string;
  lastName: string;
  rank: string;
  rankAndName: string;
  email?: string;
  lastActive?: string;
}

/**
 * Maps an IUserBriefDto object to an IUserBrief object.
 *
 * @param dto - The data transfer object containing the properties to map.
 * @returns An IAppUser object with the mapped properties.
 */
export const mapToIUserBrief = (dto: IUserBriefDto): IUserBrief => ({
  userId: dto.user_id,
  firstName: dto.first_name,
  lastName: dto.last_name,
  rank: dto.rank,
  rankAndName: `${dto.rank} ${dto.first_name} ${dto.last_name}`,
  email: dto.email,
  lastActive: dto.last_activity ? dayjs(dto.last_activity).format('MM/DD/YYYY') : undefined,
});
