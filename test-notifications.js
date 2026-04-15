/**
 * Notification API Testing Script
 * Run: node test-notifications.js
 * 
 * Tests all notification services:
 * - Email Service (Gmail/SendGrid/SMTP)
 * - SMS Service (Twilio)
 * - Push Notifications (Firebase)
 * - Event Emitter
 */

require('dotenv').config();
const axios = require('axios');
const colors = require('colors');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:8080/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PHONE = process.env.TWILIO_PHONE_NUMBER || '+919876543210';
let authToken = '';

// Test Results
const results = {
  email: { status: false, message: '' },
  sms: { status: false, message: '' },
  push: { status: false, message: '' },
  history: { status: false, message: '' },
  preferences: { status: false, message: '' }
};

/**
 * Helper function to make API calls
 */
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 0
    };
  }
}

/**
 * Print section header
 */
function printHeader(text) {
  console.log('\n' + '='.repeat(60));
  console.log(colors.cyan(`  ${text}`));
  console.log('='.repeat(60) + '\n');
}

/**
 * Print result
 */
function printResult(service, success, message) {
  const status = success ? colors.green('✅ PASS') : colors.red('❌ FAIL');
  console.log(`${status} | ${service.padEnd(20)} | ${message}`);
}

/**
 * Test 1: Check API Health
 */
async function testAPIHealth() {
  printHeader('TEST 1: API Health Check');
  
  try {
    const response = await axios.get(`${API_URL}/../`);
    console.log(colors.green('✅ API is running'));
    console.log(`   Server: ${response.data.message}`);
    return true;
  } catch (error) {
    console.log(colors.red('❌ API is not responding'));
    console.log(`   Error: ${error.message}`);
    console.log(`   Make sure backend is running: npm start`);
    return false;
  }
}

/**
 * Test 2: Environment Variables
 */
async function testEnvironmentVariables() {
  printHeader('TEST 2: Environment Variables');
  
  const requiredVars = {
    'EMAIL_SERVICE': process.env.EMAIL_SERVICE,
    'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID ? '***' : null,
    'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN ? '***' : null,
    'TWILIO_PHONE_NUMBER': process.env.TWILIO_PHONE_NUMBER,
    'FIREBASE_SERVICE_ACCOUNT_PATH': process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  };

  let allPresent = true;
  Object.entries(requiredVars).forEach(([key, value]) => {
    const status = value ? colors.green('✅') : colors.red('❌');
    console.log(`${status} ${key.padEnd(30)} ${value || 'NOT SET'}`);
    if (!value && !key.includes('AUTH_TOKEN')) allPresent = false;
  });

  if (!allPresent) {
    console.log(colors.yellow('\n⚠️  Some environment variables are missing!'));
    console.log('   Update .env file with required credentials');
  }

  return allPresent;
}

/**
 * Test 3: Email Service
 */
async function testEmailService() {
  printHeader('TEST 3: Email Service');
  
  console.log('Sending test email...\n');

  const payload = {
    channel: 'email'
  };

  const result = await apiCall('POST', '/notifications/test', payload);

  if (result.success) {
    results.email.status = true;
    results.email.message = 'Email sent successfully';
    printResult('Email Service', true, 'Test email sent');
    console.log(colors.gray(`   Message ID: ${result.data.messageId || 'N/A'}`));
  } else {
    results.email.status = false;
    results.email.message = result.error;
    printResult('Email Service', false, result.error);
  }
}

/**
 * Test 4: SMS Service
 */
async function testSMSService() {
  printHeader('TEST 4: SMS Service');
  
  console.log('Sending test SMS...\n');

  const payload = {
    channel: 'sms'
  };

  const result = await apiCall('POST', '/notifications/test', payload);

  if (result.success) {
    results.sms.status = true;
    results.sms.message = 'SMS sent successfully';
    printResult('SMS Service', true, 'Test SMS sent');
    console.log(colors.gray(`   SID: ${result.data.sid || 'N/A'}`));
  } else {
    results.sms.status = false;
    results.sms.message = result.error;
    printResult('SMS Service', false, result.error);
  }
}

/**
 * Test 5: Push Notification Service
 */
async function testPushService() {
  printHeader('TEST 5: Push Notification Service');
  
  console.log('Attempting push notification...\n');

  const payload = {
    channel: 'push'
  };

  const result = await apiCall('POST', '/notifications/test', payload);

  if (result.success) {
    results.push.status = true;
    results.push.message = 'Push notification triggered';
    printResult('Push Service', true, 'Push notification sent');
    console.log(colors.gray(`   Message ID: ${result.data.messageId || 'N/A'}`));
  } else {
    results.push.status = false;
    results.push.message = result.error;
    printResult('Push Service', false, result.error);
  }
}

/**
 * Test 6: Notification History
 */
async function testNotificationHistory() {
  printHeader('TEST 6: Notification History');
  
  console.log('Fetching notification history...\n');

  const result = await apiCall('GET', '/notifications?limit=5');

  if (result.success) {
    results.history.status = true;
    const count = result.data.data?.length || 0;
    results.history.message = `Retrieved ${count} notifications`;
    printResult('Notification History', true, `${count} notifications found`);
    
    if (count > 0) {
      console.log(colors.gray('\n   Recent notifications:'));
      result.data.data.slice(0, 3).forEach((notif, i) => {
        console.log(colors.gray(`   ${i + 1}. [${notif.type}] ${notif.subject}`));
      });
    }
  } else {
    results.history.status = false;
    results.history.message = result.error;
    printResult('Notification History', false, result.error);
  }
}

/**
 * Test 7: Get Unread Count
 */
async function testUnreadCount() {
  printHeader('TEST 7: Unread Notifications');
  
  console.log('Fetching unread count...\n');

  const result = await apiCall('GET', '/notifications/unread/count');

  if (result.success) {
    const count = result.data.unreadCount || 0;
    printResult('Unread Count', true, `${count} unread notifications`);
  } else {
    printResult('Unread Count', false, result.error);
  }
}

/**
 * Test 8: Notification Preferences
 */
async function testNotificationPreferences() {
  printHeader('TEST 8: Notification Preferences');
  
  console.log('Fetching preferences...\n');

  const result = await apiCall('GET', '/notifications/preferences');

  if (result.success) {
    results.preferences.status = true;
    results.preferences.message = 'Preferences retrieved';
    printResult('Preferences', true, 'Preferences fetched');
    
    if (result.data.preferences) {
      console.log(colors.gray('\n   Current preferences:'));
      console.log(colors.gray('   Email:', JSON.stringify(result.data.preferences.email)));
      console.log(colors.gray('   SMS:', JSON.stringify(result.data.preferences.sms)));
      console.log(colors.gray('   Push:', JSON.stringify(result.data.preferences.push)));
    }
  } else {
    results.preferences.status = false;
    results.preferences.message = result.error;
    printResult('Preferences', false, result.error);
  }
}

/**
 * Test 9: Device Registration (Mock)
 */
async function testDeviceRegistration() {
  printHeader('TEST 9: Device Registration');
  
  console.log('Testing device registration endpoint...\n');

  const payload = {
    token: 'test-device-token-' + Date.now(),
    deviceType: 'web',
    deviceData: {
      deviceName: 'Test Browser',
      deviceModel: 'Chrome/Web',
      osVersion: '1.0',
      appVersion: '1.0.0'
    }
  };

  const result = await apiCall('POST', '/notifications/devices/register', payload);

  if (result.success) {
    printResult('Device Registration', true, 'Device registered');
    console.log(colors.gray(`   Device: ${payload.deviceData.deviceName}`));
  } else {
    // Device registration might require auth, so not critical
    printResult('Device Registration', false, result.error);
  }
}

/**
 * Test 10: Database Connection
 */
async function testDatabaseConnection() {
  printHeader('TEST 10: Database Connection');
  
  // Try to fetch something from DB via API
  const result = await apiCall('GET', '/notifications?limit=1');

  if (result.success) {
    printResult('Database', true, 'Connected and responding');
  } else {
    printResult('Database', false, 'Connection failed');
  }
}

/**
 * Print Summary Report
 */
function printSummary() {
  printHeader('TEST SUMMARY');

  const passed = Object.values(results).filter(r => r.status).length;
  const total = Object.keys(results).length;
  const percentage = Math.round((passed / total) * 100);

  console.log(colors.cyan(`\nResults: ${passed}/${total} tests passed (${percentage}%)\n`));

  Object.entries(results).forEach(([service, result]) => {
    const status = result.status ? colors.green('✅') : colors.red('❌');
    console.log(`${status} ${service.padEnd(15)} : ${result.message}`);
  });

  console.log('\n' + '='.repeat(60));

  if (passed === total) {
    console.log(colors.green('\n🎉 All tests passed! Notification system is working correctly.\n'));
  } else {
    console.log(colors.yellow(`\n⚠️  ${total - passed} test(s) failed. Check configuration and try again.\n`));
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.clear();
  console.log(colors.cyan('\n'));
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          NOTIFICATION SYSTEM - API TEST SUITE              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Check if API is running
  const isHealthy = await testAPIHealth();
  if (!isHealthy) {
    console.log(colors.red('\n❌ Cannot continue: API is not responding'));
    process.exit(1);
  }

  // Run environment check
  await testEnvironmentVariables();

  // Run service tests
  await testEmailService();
  await testSMSService();
  await testPushService();

  // Run data retrieval tests
  await testNotificationHistory();
  await testUnreadCount();
  await testNotificationPreferences();

  // Run device tests
  await testDeviceRegistration();

  // Run database test
  await testDatabaseConnection();

  // Print summary
  printSummary();

  // Recommendations
  printHeader('RECOMMENDATIONS');
  
  if (!results.email.status) {
    console.log(colors.yellow('📧 Email Service Issue:'));
    console.log('   1. Check EMAIL_SERVICE in .env');
    console.log('   2. Verify email credentials (Gmail password or SendGrid API key)');
    console.log('   3. Check GMAIL_EMAIL matches your email');
  }

  if (!results.sms.status) {
    console.log(colors.yellow('\n📱 SMS Service Issue:'));
    console.log('   1. Verify Twilio credentials in .env');
    console.log('   2. Check TWILIO_PHONE_NUMBER is correct');
    console.log('   3. Ensure Twilio account has balance');
  }

  if (!results.push.status) {
    console.log(colors.yellow('\n🔔 Push Service Issue:'));
    console.log('   1. Verify serviceAccountKey.json exists');
    console.log('   2. Check VAPID_PUBLIC_KEY in .env');
    console.log('   3. Ensure Firebase Cloud Messaging is enabled');
  }

  console.log('\n');
}

// Run tests
runTests().catch(error => {
  console.error(colors.red('Test runner error:'), error.message);
  process.exit(1);
});
