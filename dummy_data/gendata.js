function generatePostData(startDate, endDate, numberOfPosts) {
  const postTypes = [
    "Static Image",
    "Carousel",
    "Reel",
    "Shots",
    "Video",
    "Gif",
    "Post",
  ];

  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const randomDate = (start, end) => {
    // const startTimestamp = new Date(start).getTime();
    // const endTimestamp = new Date(end).getTime();
    // const randomTimestamp = randomInt(startTimestamp, endTimestamp);
    // return new Date(randomTimestamp).toISOString();
    const startTimestamp = new Date(start).getTime();
    const endTimestamp = new Date(end).getTime();
    const randomTimestamp = randomInt(startTimestamp, endTimestamp);
    const date = new Date(randomTimestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const posts = Array.from({ length: numberOfPosts }, (_, index) => ({
    POST_ID: index + 1,
    POST_TYPE: postTypes[randomInt(0, postTypes.length - 1)],
    LIKES: randomInt(0, 5000),
    SHARES: randomInt(0, 1000),
    COMMENTS: randomInt(0, 1000),
    VIEWS: randomInt(0, 100000),
    SAVES: randomInt(0, 500),
    DATE: randomDate(startDate, endDate),
  }));

  return posts;
  //   const headers = Object.keys(posts[0]).join(","); // Create CSV header
  //   const rows = posts.map((post) => Object.values(post).join(",")); // Create CSV rows

  //   return [headers, ...rows].join("\n"); // Combine header and rows into a single string
}

// Example usage
const startDate = "2024-11-30";
const endDate = "2024-12-31";
const numberOfPosts = 50;
console.log(
  JSON.stringify(generatePostData(startDate, endDate, numberOfPosts))
);
