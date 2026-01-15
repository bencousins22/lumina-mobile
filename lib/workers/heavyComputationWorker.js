self.onmessage = function(e) {
  const { task, data } = e.data;
  
  // Simulate heavy computation
  let result;
  if (task === 'processData') {
    result = data.map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }));
  }
  
  self.postMessage({ result });
}
