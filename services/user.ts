const serverAPI = process.env.EXPO_PUBLIC_CITYSTAT_API_URL;

export const persistCreatedUserInDB = async (userToken: string) => {
  const response = await fetch(serverAPI+"/api/user", {
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
  });
   
   console.log(response)

  return response.json();
};
