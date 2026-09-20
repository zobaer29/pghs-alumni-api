/**
 * Helper utility to upload images to ImgBB API
 */

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb?: {
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export const uploadToImgBB = async (base64OrUrl: string): Promise<string> => {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error('IMGBB_API_KEY is missing in environment variables.');
  }

  // Remove data:image/...;base64, prefix if present
  const cleanBase64 = base64OrUrl.replace(/^data:image\/\w+;base64,/, '');

  const formData = new URLSearchParams();
  formData.append('image', cleanBase64);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ImgBB upload failed: ${response.statusText} - ${errorText}`);
  }

  const result = (await response.json()) as ImgBBResponse;

  if (!result.success || !result.data?.url) {
    throw new Error('ImgBB upload was not successful.');
  }

  return result.data.url;
};
