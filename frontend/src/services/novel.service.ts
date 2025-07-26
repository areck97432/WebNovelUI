import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const getNovels = async () => {
  const response = await axios.get(`${API_URL}/novels`);
  return response.data;
};

export const getNovel = async (slug: string) => {
  const response = await axios.get(`${API_URL}/novels/${slug}`);
  return response.data;
};

export const getChapter = async (slug: string, chapterNumber: number) => {
  const response = await axios.get(`${API_URL}/novels/${slug}/chapter/${chapterNumber}`);
  return response.data;
};
