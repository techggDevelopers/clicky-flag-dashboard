const Flag = require('../models/Flag');

const initializeFlags = async () => {
  const count = await Flag.countDocuments();
  if (count === 0) {
    const initialFlags = [
      {
        name: "F1",
        label: "D",
        description: ""
      },
      {
        name: "F2",
        label: "R",
        description: ""
      },
      {
        name: "F3",
        label: "S",
        description: ""
      }
    ];

    await Flag.insertMany(initialFlags);
    console.log('Initial flags created');
  }
};

module.exports = initializeFlags;
