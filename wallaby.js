module.exports = function (w) {
  process.env.TEST_ENV = "wallaby";

    return {
      env: {
          type: "node",
          runner: "node",
      },
      files: [
        'src/**/*.ts',
        "!src/**/*.spec.ts"
      ],
      testFramework: "jest",
  
      tests: [
        'src/**/*.spec.ts'
      ]
    };
  };
  