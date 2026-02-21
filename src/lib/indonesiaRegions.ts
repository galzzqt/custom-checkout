// src/lib/indonesiaRegions.ts
interface Region {
  id: string;
  name: string;
}

export const fetchProvinces = async (): Promise<Region[]> => {
  try {
    const response = await fetch(
      `https://api.binderbyte.com/wilayah/provinsi?api_key=${process.env.NEXT_PUBLIC_BINDERBYTE_API_KEY}`
    );
    const data = await response.json();
    return data.value.map((prov: any) => ({
      id: prov.id,
      name: prov.name
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

export const fetchCities = async (provinceId: string): Promise<Region[]> => {
  try {
    const response = await fetch(
      `https://api.binderbyte.com/wilayah/kabupaten?api_key=${process.env.NEXT_PUBLIC_BINDERBYTE_API_KEY}&id_provinsi=${provinceId}`
    );
    const data = await response.json();
    return data.value.map((city: any) => ({
      id: city.id,
      name: city.name
    }));
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};