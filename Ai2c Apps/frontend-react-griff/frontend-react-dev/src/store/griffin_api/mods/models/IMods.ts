export type IModsDto = {
  serial_number: string;
  [key: string]: string;
};

export type IMods = {
  serialNumber: string;
  [key: string]: string;
};

export const mapToMods = (dto: IModsDto): IMods => {
  const data: IMods = {} as IMods;
  Object.entries(dto).forEach(([key, value]) => {
    if (key === 'serial_number') {
      data['serialNumber'] = value;
    } else {
      data[key] = value;
    }
  });

  return data;
};
