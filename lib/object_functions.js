// Compare objects with symmetrical keys
exports.diff_object = function (a, b) {
  return Object.keys(a).reduce(function (map, k) {
    if (a[k] !== b[k]) {
      map[k] = b[k];
    }
    return map;
  }, {});
};

// Function to see if an array contains all elments of the other
exports.array_contains_array = function (superset, subset) {
  if (subset.length === 0) {
    return false;
  }
  return subset.every(function (value) {
    return superset.indexOf(value) >= 0;
  });
};
