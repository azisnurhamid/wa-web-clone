CREATE TABLE IF NOT EXISTS visitor_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_address TEXT,
  user_agent TEXT,
  os TEXT,
  browser TEXT,
  device_type TEXT,
  screen_resolution TEXT,
  language TEXT,
  timezone TEXT,
  connection_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
