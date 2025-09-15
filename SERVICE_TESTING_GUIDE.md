# Service Testing Guide

## Overview
This guide provides comprehensive instructions for testing the WebSocketService, AlertEngineService, and PushNotificationService in the Kuyash Farm Management System.

## Service Status
✅ **All services are now properly initialized without warnings**
✅ **All test endpoints are functional**
✅ **Service health monitoring is active**

## Quick Service Health Check

### Check All Services Status
```bash
curl -X GET http://localhost:5058/api/health/services
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Service health check completed",
  "overallHealth": "healthy",
  "services": {
    "WebSocketService": {
      "status": "healthy",
      "initialized": true,
      "connectedFarms": [],
      "totalConnections": 0
    },
    "AlertEngineService": {
      "status": "healthy",
      "initialized": true
    },
    "PushNotificationService": {
      "status": "healthy",
      "initialized": true
    },
    "IoTService": {
      "status": "healthy",
      "initialized": true
    }
  }
}
```

## Individual Service Testing

### 1. WebSocketService Testing

#### Test WebSocket Functionality
```bash
curl -X POST http://localhost:5058/api/test/websocket \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "WebSocket test completed successfully",
  "service": "WebSocketService",
  "status": "active",
  "data": {
    "totalConnections": 0,
    "connectedFarms": [],
    "testMessage": {
      "type": "test",
      "message": "WebSocket test message",
      "timestamp": "2025-09-14T10:32:06.432Z",
      "data": {
        "testId": "vcht1f0en",
        "source": "test-endpoint"
      }
    },
    "broadcastSent": true
  }
}
```

#### Test WebSocket with Browser (Real-time Testing)
1. Open browser developer tools
2. Navigate to Console tab
3. Connect to WebSocket:
```javascript
const ws = new WebSocket('ws://localhost:5058');
ws.onopen = () => console.log('Connected to WebSocket');
ws.onmessage = (event) => console.log('Received:', JSON.parse(event.data));
ws.onerror = (error) => console.error('WebSocket error:', error);
```
4. Send test message via API (above curl command)
5. Check console for received broadcast message

### 2. AlertEngineService Testing

#### Test Alert Generation
```bash
curl -X POST http://localhost:5058/api/test/alerts \
  -H "Content-Type: application/json" \
  -d '{"farmId":"test-farm-123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Alert test completed successfully",
  "service": "AlertEngineService",
  "status": "active",
  "data": {
    "farmId": "test-farm-001",
    "alertType": "iot_sensor",
    "severity": "medium",
    "title": "Test Alert",
    "message": "This is a test alert to verify AlertEngine functionality",
    "testData": {
      "sensorType": "temperature",
      "value": 35.5,
      "threshold": 30,
      "location": "Greenhouse A"
    },
    "alertTriggered": true
  }
}
```

#### Test Alert with WebSocket Integration
1. Connect to WebSocket (see WebSocket testing above)
2. Send alert test request
3. Check WebSocket console for real-time alert broadcast

### 3. PushNotificationService Testing

#### Test Push Notification
```bash
curl -X POST http://localhost:5058/api/test/push \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://test.example.com",
      "keys": {
        "p256dh": "test-key",
        "auth": "test-auth"
      }
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Push notification test completed successfully",
  "service": "PushNotificationService",
  "status": "active",
  "data": {
    "payload": {
      "title": "Test Push Notification",
      "body": "This is a test push notification from the farm management system",
      "icon": "/icons/notification-icon.png",
      "badge": "/icons/badge-icon.png",
      "tag": "test-notification",
      "data": {
        "type": "test",
        "farmId": "test-farm-001",
        "timestamp": "2025-09-14T10:32:18.778Z"
      }
    },
    "context": {
      "farmId": "test-farm-001",
      "userId": "test-user-001",
      "type": "system",
      "priority": "medium"
    },
    "notificationSent": true,
    "note": "Test notifications sent to test-user-001 and test-farm-001 (if they exist)"
  }
}
```

## Integration Testing

### Test All Services Together
```bash
# 1. Check service health
curl -X GET http://localhost:5058/api/health/services

# 2. Test WebSocket
curl -X POST http://localhost:5058/api/test/websocket -H "Content-Type: application/json" -d '{"message":"integration-test"}'

# 3. Test Alerts (will also broadcast via WebSocket)
curl -X POST http://localhost:5058/api/test/alerts -H "Content-Type: application/json" -d '{"farmId":"integration-test-farm"}'

# 4. Test Push Notifications
curl -X POST http://localhost:5058/api/test/push -H "Content-Type: application/json" -d '{"subscription":{"endpoint":"https://test.example.com","keys":{"p256dh":"test-key","auth":"test-auth"}}}'
```

## Troubleshooting

### Common Issues

1. **Service Not Initialized**
   - Check server logs for initialization errors
   - Verify database connection
   - Ensure all environment variables are set

2. **WebSocket Connection Failed**
   - Check if port 5058 is accessible
   - Verify WebSocket server is running
   - Check browser console for connection errors

3. **Authentication Errors**
   - Test endpoints are now public (no authentication required)
   - For production endpoints, ensure valid JWT token

### Server Logs
Monitor server logs for real-time service activity:
```bash
# In the server directory
npm run dev
```

Look for these success messages:
- ✅ Database connection established successfully
- 🚨 Alert engine monitoring started
- ✅ Real-time services initialized and registered in ServiceFactory
- ✅ Routes initialized after services are ready
- 🚀 Server running on port 5058
- 🔌 WebSocket server ready
- 🔔 Push notification service ready
- 🚨 Alert engine monitoring active

## Production Considerations

1. **Security**: Re-enable authentication for production endpoints
2. **Rate Limiting**: Test endpoints should have appropriate rate limits
3. **Monitoring**: Set up proper health check monitoring
4. **Logging**: Ensure proper logging for all service activities
5. **Error Handling**: Test error scenarios and recovery

## Next Steps

1. **Frontend Integration**: Connect frontend WebSocket client
2. **Real User Testing**: Test with actual farm data and users
3. **Performance Testing**: Load test with multiple concurrent connections
4. **Alert Rules**: Configure production alert rules and thresholds
5. **Push Subscription**: Implement proper push notification subscription flow

---

**All services are now fully functional and ready for development and testing!**