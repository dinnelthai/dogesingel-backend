module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: ['**/tests/**/*.test.js'],
  
  // 覆盖率收集
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**'
  ],
  
  // 测试超时时间
  testTimeout: 10000,
  
  // 在每个测试文件执行前清除所有模拟
  clearMocks: true,
  
  // 显示详细的测试输出
  verbose: true
};
