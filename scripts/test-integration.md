# Frontend-Backend Integration Test Guide

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd GreenStepBackend
   npm run dev
   ```
   Server should be running on `http://localhost:8000`

2. **MongoDB Database**
   - Ensure MongoDB is running
   - Database should be accessible at the configured URL

3. **Frontend App Running**
   ```bash
   cd GreenStep-Frontend
   npm start
   ```

## Test Steps

### 1. Authentication Test

**Login with Demo Credentials:**
- Username: `johndoe`
- Password: `password123`

**Expected Results:**
- ✅ Login should succeed
- ✅ User should be redirected to dashboard
- ✅ Auth state should be maintained

**Alternative Test:**
- Register a new user
- Login with new credentials

### 2. Dashboard Data Loading Test

**Check Dashboard Overview Tab:**
- ✅ Stats cards should show real data
- ✅ Charts should render with data
- ✅ Loading indicators should appear briefly

**Expected Data:**
- Total trees count
- Carbon absorption metrics
- Health distribution
- Growth trend charts

### 3. Tree Management Test

**Add New Tree:**
1. Go to "My Trees" tab
2. Tap "Add New Tree" button
3. Fill in tree details:
   - Name: "Test Tree"
   - Species: "Quercus robur"
   - Location: "Test Garden"
   - Height: 1.5
   - Diameter: 0.1
4. Save tree

**Expected Results:**
- ✅ Tree should be added successfully
- ✅ Tree should appear in trees list
- ✅ Stats should update automatically

### 4. Care Records Test

**Add Care Record:**
1. Go to "Care Log" tab
2. Tap "Record Care Activity" button
3. Fill in care details:
   - Tree: Select a tree
   - Action: "watering"
   - Notes: "Test watering"
   - Health Rating: 5
4. Save record

**Expected Results:**
- ✅ Care record should be added
- ✅ Record should appear in care log
- ✅ Tree health should update

### 5. Care Reminders Test

**Check Reminders:**
- ✅ Reminders should load from backend
- ✅ Tap to mark reminder as completed
- ✅ Reminder should update status

### 6. Analytics Test

**Check Analytics Tab:**
- ✅ Community analytics should load
- ✅ Monthly progress chart should render
- ✅ Species distribution should show data

## API Endpoint Tests

### Direct API Testing (Optional)

**Test Authentication:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "password": "password123"}'
```

**Test Dashboard Stats:**
```bash
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Trees Endpoint:**
```bash
curl -X GET http://localhost:8000/api/dashboard/trees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

**1. Connection Refused**
- Check if backend server is running
- Verify port 8000 is not blocked
- Check firewall settings

**2. Authentication Failed**
- Verify demo credentials
- Check JWT token in browser dev tools
- Ensure cookies are enabled

**3. Data Not Loading**
- Check browser network tab for failed requests
- Verify MongoDB connection
- Check backend logs for errors

**4. CORS Issues**
- Ensure CORS is configured in backend
- Check frontend URL in backend CORS settings

### Debug Steps

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests
   - Verify API responses

2. **Check Backend Logs**
   - Look for server errors
   - Verify database connections
   - Check request processing

3. **Check Database**
   - Verify sample data exists
   - Check collection structure
   - Verify indexes are created

## Expected Behavior

### Successful Integration

- ✅ Authentication works seamlessly
- ✅ Data loads from backend
- ✅ Real-time updates work
- ✅ Error handling works
- ✅ Loading states appear
- ✅ Charts render with data
- ✅ CRUD operations work

### Performance Expectations

- Initial load: < 3 seconds
- API responses: < 1 second
- Chart rendering: < 2 seconds
- Smooth animations and transitions

## Next Steps

After successful integration:

1. **Add More Features**
   - Image uploads
   - Push notifications
   - Offline support

2. **Performance Optimization**
   - Implement caching
   - Add pagination
   - Optimize queries

3. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

4. **Deployment**
   - Production backend
   - App store deployment
   - CI/CD pipeline
