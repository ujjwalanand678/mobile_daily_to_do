// Simple utility to test storage functionality
export const testStorage = () => {
  console.log('Testing storage functionality...');
  
  // Test adding a task
  const testTask = {
    title: 'Test Task',
    notes: 'This is a test',
    isCompleted: false,
    priority: 'med' as const,
    folderId: 'default',
    tags: [],
  };
  
  console.log('✅ Storage test utility ready');
  return testTask;
};
