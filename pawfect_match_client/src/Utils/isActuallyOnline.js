export const isActuallyOnline = async () => {
  if (!navigator.onLine) return false;

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
      method: "GET",
      cache: "no-cache",
    });
    return response.ok;
  } catch {
    return false;
  }
};
