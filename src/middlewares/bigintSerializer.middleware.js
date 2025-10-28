export const bigintSerializer = (req, res, next) => {
  const oldJson = res.json;
  res.json = function (data) {
    function replacer(key, value) {
      return typeof value === "bigint" ? value.toString() : value;
    }
    oldJson.call(this, JSON.parse(JSON.stringify(data, replacer)));
  };
  next();
};
