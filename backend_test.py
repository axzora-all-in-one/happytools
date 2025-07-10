#!/usr/bin/env python3
"""
HappyTools AI Tools Discovery Platform - Enhanced Backend Testing
Tests all new features including AITools.fyi scraper, enhanced filtering, and new endpoints
"""

import requests
import json
import time
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://72a54ba1-07cf-4ab8-897f-ab6090b9679b.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

def log_test(test_name, status, details=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"[{timestamp}] {status_symbol} {test_name}")
    if details:
        print(f"    Details: {details}")
    print()

def test_health_check():
    """Test GET /api/status endpoint"""
    try:
        response = requests.get(f"{API_BASE}/status", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            log_test("GET /api/status - Health Check", "PASS", f"Response: {data}")
            return True
        else:
            log_test("GET /api/status - Health Check", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        log_test("GET /api/status - Health Check", "FAIL", f"Exception: {str(e)}")
        return False

def test_ai_tools_endpoint():
    """Test GET /api/ai-tools endpoint with various parameters"""
    tests_passed = 0
    total_tests = 4
    
    # Test 1: Basic endpoint without parameters
    try:
        response = requests.get(f"{API_BASE}/ai-tools", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if 'tools' in data and 'pagination' in data:
                log_test("GET /api/ai-tools - Basic Request", "PASS", 
                        f"Found {len(data['tools'])} tools, pagination: {data['pagination']}")
                tests_passed += 1
            else:
                log_test("GET /api/ai-tools - Basic Request", "FAIL", 
                        f"Missing required fields in response: {data}")
        else:
            log_test("GET /api/ai-tools - Basic Request", "FAIL", 
                    f"Status: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        log_test("GET /api/ai-tools - Basic Request", "FAIL", f"Exception: {str(e)}")
    
    # Test 2: Pagination test
    try:
        response = requests.get(f"{API_BASE}/ai-tools?page=1&limit=5", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if len(data['tools']) <= 5 and data['pagination']['limit'] == 5:
                log_test("GET /api/ai-tools - Pagination", "PASS", 
                        f"Correctly limited to {len(data['tools'])} tools")
                tests_passed += 1
            else:
                log_test("GET /api/ai-tools - Pagination", "FAIL", 
                        f"Pagination not working correctly: {data['pagination']}")
        else:
            log_test("GET /api/ai-tools - Pagination", "FAIL", 
                    f"Status: {response.status_code}")
            
    except Exception as e:
        log_test("GET /api/ai-tools - Pagination", "FAIL", f"Exception: {str(e)}")
    
    # Test 3: Search functionality
    try:
        response = requests.get(f"{API_BASE}/ai-tools?search=AI", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            log_test("GET /api/ai-tools - Search", "PASS", 
                    f"Search returned {len(data['tools'])} tools")
            tests_passed += 1
        else:
            log_test("GET /api/ai-tools - Search", "FAIL", 
                    f"Status: {response.status_code}")
            
    except Exception as e:
        log_test("GET /api/ai-tools - Search", "FAIL", f"Exception: {str(e)}")
    
    # Test 4: Source filtering
    try:
        response = requests.get(f"{API_BASE}/ai-tools?source=Product Hunt", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            log_test("GET /api/ai-tools - Source Filter", "PASS", 
                    f"Source filter returned {len(data['tools'])} tools")
            tests_passed += 1
        else:
            log_test("GET /api/ai-tools - Source Filter", "FAIL", 
                    f"Status: {response.status_code}")
            
    except Exception as e:
        log_test("GET /api/ai-tools - Source Filter", "FAIL", f"Exception: {str(e)}")
    
    return tests_passed == total_tests

def test_trending_endpoint():
    """Test GET /api/ai-tools/trending endpoint"""
    try:
        response = requests.get(f"{API_BASE}/ai-tools/trending", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if 'tools' in data:
                tools = data['tools']
                log_test("GET /api/ai-tools/trending - Basic", "PASS", 
                        f"Found {len(tools)} trending tools")
                
                # Test with limit parameter
                response2 = requests.get(f"{API_BASE}/ai-tools/trending?limit=3", timeout=15)
                if response2.status_code == 200:
                    data2 = response2.json()
                    if len(data2['tools']) <= 3:
                        log_test("GET /api/ai-tools/trending - Limit", "PASS", 
                                f"Correctly limited to {len(data2['tools'])} tools")
                        return True
                    else:
                        log_test("GET /api/ai-tools/trending - Limit", "FAIL", 
                                f"Limit not working: got {len(data2['tools'])} tools")
                        return False
                else:
                    log_test("GET /api/ai-tools/trending - Limit", "FAIL", 
                            f"Status: {response2.status_code}")
                    return False
            else:
                log_test("GET /api/ai-tools/trending - Basic", "FAIL", 
                        f"Missing 'tools' field in response: {data}")
                return False
        else:
            log_test("GET /api/ai-tools/trending - Basic", "FAIL", 
                    f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        log_test("GET /api/ai-tools/trending", "FAIL", f"Exception: {str(e)}")
        return False

def test_sync_endpoint():
    """Test POST /api/ai-tools/sync endpoint"""
    try:
        print("Testing Product Hunt sync endpoint (this may take a while)...")
        response = requests.post(f"{API_BASE}/ai-tools/sync", timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            if 'synced' in data and 'total_found' in data:
                log_test("POST /api/ai-tools/sync - Product Hunt Integration", "PASS", 
                        f"Synced {data['synced']} new tools out of {data['total_found']} found")
                return True
            else:
                log_test("POST /api/ai-tools/sync - Product Hunt Integration", "FAIL", 
                        f"Missing required fields in response: {data}")
                return False
        else:
            log_test("POST /api/ai-tools/sync - Product Hunt Integration", "FAIL", 
                    f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        log_test("POST /api/ai-tools/sync - Product Hunt Integration", "FAIL", f"Exception: {str(e)}")
        return False

def test_cors_headers():
    """Test CORS headers are properly set"""
    try:
        response = requests.options(f"{API_BASE}/ai-tools", timeout=10)
        
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers'
        ]
        
        missing_headers = []
        for header in cors_headers:
            if header not in response.headers:
                missing_headers.append(header)
        
        if not missing_headers:
            log_test("CORS Headers Check", "PASS", "All required CORS headers present")
            return True
        else:
            log_test("CORS Headers Check", "FAIL", f"Missing headers: {missing_headers}")
            return False
            
    except Exception as e:
        log_test("CORS Headers Check", "FAIL", f"Exception: {str(e)}")
        return False

def test_error_handling():
    """Test error handling for invalid routes"""
    try:
        response = requests.get(f"{API_BASE}/invalid-route", timeout=10)
        
        if response.status_code == 404:
            data = response.json()
            if 'error' in data:
                log_test("Error Handling - Invalid Route", "PASS", 
                        f"Correctly returned 404 with error message: {data['error']}")
                return True
            else:
                log_test("Error Handling - Invalid Route", "FAIL", 
                        f"404 returned but no error message: {data}")
                return False
        else:
            log_test("Error Handling - Invalid Route", "FAIL", 
                    f"Expected 404, got {response.status_code}")
            return False
            
    except Exception as e:
        log_test("Error Handling - Invalid Route", "FAIL", f"Exception: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("=" * 80)
    print("AI TOOLS DISCOVERY PLATFORM - BACKEND TESTING")
    print("=" * 80)
    print(f"Testing API at: {API_BASE}")
    print()
    
    test_results = []
    
    # Test 1: Health Check
    print("1. HEALTH CHECK TESTS")
    print("-" * 40)
    test_results.append(test_health_check())
    
    # Test 2: CORS Headers
    print("2. CORS HEADERS TESTS")
    print("-" * 40)
    test_results.append(test_cors_headers())
    
    # Test 3: Error Handling
    print("3. ERROR HANDLING TESTS")
    print("-" * 40)
    test_results.append(test_error_handling())
    
    # Test 4: Product Hunt Sync (run first to populate database)
    print("4. PRODUCT HUNT SYNC TESTS")
    print("-" * 40)
    sync_result = test_sync_endpoint()
    test_results.append(sync_result)
    
    # Wait a bit for sync to complete
    if sync_result:
        print("Waiting 5 seconds for sync to complete...")
        time.sleep(5)
    
    # Test 5: AI Tools Endpoint
    print("5. AI TOOLS ENDPOINT TESTS")
    print("-" * 40)
    test_results.append(test_ai_tools_endpoint())
    
    # Test 6: Trending Endpoint
    print("6. TRENDING ENDPOINT TESTS")
    print("-" * 40)
    test_results.append(test_trending_endpoint())
    
    # Summary
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(test_results)
    total = len(test_results)
    
    print(f"Tests Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the details above.")
    
    return passed == total

if __name__ == "__main__":
    main()