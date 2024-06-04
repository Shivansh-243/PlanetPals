const getLocation = (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    const successCallback = (position: GeolocationPosition) => {
      console.log(position);
      resolve([
        position.coords.latitude + Math.random() * 10,
        position.coords.longitude + Math.random() * 10,
      ]);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.log(error);
      resolve([-1, -1]);
    };
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          successCallback,
          errorCallback
        );
      } else {
        console.log("Geolocation is not supported by this browser.");
        resolve([-1, -1]);
      }
    } catch {
      console.log("some error occur during the fetching of the location");
    }
  });
};

const coords = async () => {
  const location = await getLocation();
  console.log(location);
};

// Call the async function to get and log the coordinates
coords();

export default getLocation;
