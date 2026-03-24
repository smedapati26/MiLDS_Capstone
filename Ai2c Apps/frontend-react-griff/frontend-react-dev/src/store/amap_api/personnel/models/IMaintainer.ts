export interface IMaintainerDto {
  user_id: string;
  first_name: string;
  last_name: string;
  ml: string;
  mos: string;
  availability_flag: boolean;
}

export interface IMaintainer {
  userId: string;
  firstName: string;
  lastName: string;
  ml: string;
  mos: string;
  availabilityFlag: boolean;
}

export const mapToIMaintainer = (dto: IMaintainerDto): IMaintainer => ({
  userId: dto.user_id,
  firstName: dto.first_name,
  lastName: dto.last_name,
  ml: dto.ml,
  mos: dto.mos,
  availabilityFlag: dto.availability_flag,
});
