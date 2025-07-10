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

class HappyToolsBackendTester:
    def __init__(self):
        self.api_base = API_BASE
        self.test_results = []
        
    def log_test(self, test_name, success, details="", error=""):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'error': error,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
        print()

    def test_enhanced_ai_tools_endpoint(self):
        """Test the enhanced GET /api/ai-tools endpoint with new parameters"""
        print("🔍 Testing Enhanced AI Tools Endpoint...")
        
        try:
            # Test 1: Basic endpoint
            response = requests.get(f"{self.api_base}/ai-tools", timeout=30)
            if response.status_code == 200:
                data = response.json()
                if 'tools' in data and 'pagination' in data:
                    self.log_test("GET /api/ai-tools - Basic functionality", True, 
                                f"Returned {len(data['tools'])} tools with pagination")
                else:
                    self.log_test("GET /api/ai-tools - Basic functionality", False, 
                                "Missing tools or pagination in response")
                    return
            else:
                self.log_test("GET /api/ai-tools - Basic functionality", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return

            # Test 2: Pagination parameters
            response = requests.get(f"{self.api_base}/ai-tools?page=1&limit=5", timeout=30)
            if response.status_code == 200:
                data = response.json()
                if len(data['tools']) <= 5 and data['pagination']['limit'] == 5:
                    self.log_test("GET /api/ai-tools - Pagination", True, 
                                f"Correctly limited to {len(data['tools'])} tools")
                else:
                    self.log_test("GET /api/ai-tools - Pagination", False, 
                                f"Pagination not working correctly")
            else:
                self.log_test("GET /api/ai-tools - Pagination", False, 
                            f"HTTP {response.status_code}")

            # Test 3: Search functionality
            response = requests.get(f"{self.api_base}/ai-tools?search=AI", timeout=30)
            if response.status_code == 200:
                data = response.json()
                self.log_test("GET /api/ai-tools - Search", True, 
                            f"Search returned {len(data['tools'])} tools")
            else:
                self.log_test("GET /api/ai-tools - Search", False, 
                            f"HTTP {response.status_code}")

            # Test 4: Category filtering
            response = requests.get(f"{self.api_base}/ai-tools?category=General", timeout=30)
            if response.status_code == 200:
                data = response.json()
                self.log_test("GET /api/ai-tools - Category filtering", True, 
                            f"Category filter returned {len(data['tools'])} tools")
            else:
                self.log_test("GET /api/ai-tools - Category filtering", False, 
                            f"HTTP {response.status_code}")

            # Test 5: Source filtering
            response = requests.get(f"{self.api_base}/ai-tools?source=Product Hunt", timeout=30)
            if response.status_code == 200:
                data = response.json()
                self.log_test("GET /api/ai-tools - Source filtering", True, 
                            f"Source filter returned {len(data['tools'])} tools")
            else:
                self.log_test("GET /api/ai-tools - Source filtering", False, 
                            f"HTTP {response.status_code}")

            # Test 6: Sorting options
            for sort_option in ['votes', 'name', 'rating', 'featured_at']:
                response = requests.get(f"{self.api_base}/ai-tools?sort={sort_option}&limit=3", timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    self.log_test(f"GET /api/ai-tools - Sort by {sort_option}", True, 
                                f"Returned {len(data['tools'])} tools sorted by {sort_option}")
                else:
                    self.log_test(f"GET /api/ai-tools - Sort by {sort_option}", False, 
                                f"HTTP {response.status_code}")

        except Exception as e:
            self.log_test("GET /api/ai-tools - Enhanced endpoint", False, error=str(e))

    def test_product_hunt_sync(self):
        """Test the existing Product Hunt sync endpoint"""
        print("🔄 Testing Product Hunt Sync...")
        
        try:
            response = requests.post(f"{self.api_base}/ai-tools/sync", timeout=60)
            if response.status_code == 200:
                data = response.json()
                if 'synced' in data and 'total_found' in data:
                    self.log_test("POST /api/ai-tools/sync - Product Hunt", True, 
                                f"Synced {data['synced']} new tools, found {data['total_found']} total")
                else:
                    self.log_test("POST /api/ai-tools/sync - Product Hunt", False, 
                                "Missing sync data in response")
            else:
                self.log_test("POST /api/ai-tools/sync - Product Hunt", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("POST /api/ai-tools/sync - Product Hunt", False, error=str(e))

    def test_aitools_fyi_sync(self):
        """Test the NEW AITools.fyi scraper endpoint"""
        print("🕷️ Testing AITools.fyi Scraper...")
        
        try:
            response = requests.post(f"{self.api_base}/ai-tools/sync-aitools", timeout=120)
            if response.status_code == 200:
                data = response.json()
                if 'synced' in data and 'total_found' in data:
                    self.log_test("POST /api/ai-tools/sync-aitools - AITools.fyi", True, 
                                f"Synced {data['synced']} new tools, found {data['total_found']} total")
                else:
                    self.log_test("POST /api/ai-tools/sync-aitools - AITools.fyi", False, 
                                "Missing sync data in response")
            else:
                self.log_test("POST /api/ai-tools/sync-aitools - AITools.fyi", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("POST /api/ai-tools/sync-aitools - AITools.fyi", False, error=str(e))

    def test_sync_all_sources(self):
        """Test the NEW sync-all endpoint"""
        print("🔄 Testing Sync All Sources...")
        
        try:
            response = requests.post(f"{self.api_base}/ai-tools/sync-all", timeout=180)
            if response.status_code == 200:
                data = response.json()
                if 'synced' in data:
                    self.log_test("POST /api/ai-tools/sync-all - All sources", True, 
                                f"Synced {data['synced']} new tools from all sources")
                else:
                    self.log_test("POST /api/ai-tools/sync-all - All sources", False, 
                                "Missing sync data in response")
            else:
                self.log_test("POST /api/ai-tools/sync-all - All sources", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("POST /api/ai-tools/sync-all - All sources", False, error=str(e))

    def test_trending_endpoint(self):
        """Test the trending tools endpoint"""
        print("📈 Testing Trending Endpoint...")
        
        try:
            # Test without limit
            response = requests.get(f"{self.api_base}/ai-tools/trending", timeout=30)
            if response.status_code == 200:
                data = response.json()
                if 'tools' in data:
                    self.log_test("GET /api/ai-tools/trending - Default", True, 
                                f"Returned {len(data['tools'])} trending tools")
                else:
                    self.log_test("GET /api/ai-tools/trending - Default", False, 
                                "Missing tools in response")
            else:
                self.log_test("GET /api/ai-tools/trending - Default", False, 
                            f"HTTP {response.status_code}")

            # Test with limit
            response = requests.get(f"{self.api_base}/ai-tools/trending?limit=5", timeout=30)
            if response.status_code == 200:
                data = response.json()
                if len(data['tools']) <= 5:
                    self.log_test("GET /api/ai-tools/trending - With limit", True, 
                                f"Correctly limited to {len(data['tools'])} tools")
                else:
                    self.log_test("GET /api/ai-tools/trending - With limit", False, 
                                "Limit parameter not working")
            else:
                self.log_test("GET /api/ai-tools/trending - With limit", False, 
                            f"HTTP {response.status_code}")

        except Exception as e:
            self.log_test("GET /api/ai-tools/trending", False, error=str(e))

    def test_categories_endpoint(self):
        """Test the NEW categories endpoint"""
        print("📂 Testing Categories Endpoint...")
        
        try:
            response = requests.get(f"{self.api_base}/ai-tools/categories", timeout=30)
            if response.status_code == 200:
                data = response.json()
                if 'categories' in data and isinstance(data['categories'], list):
                    self.log_test("GET /api/ai-tools/categories", True, 
                                f"Returned {len(data['categories'])} categories: {data['categories'][:5]}")
                else:
                    self.log_test("GET /api/ai-tools/categories", False, 
                                "Missing or invalid categories in response")
            else:
                self.log_test("GET /api/ai-tools/categories", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET /api/ai-tools/categories", False, error=str(e))

    def test_stats_endpoint(self):
        """Test the NEW stats endpoint"""
        print("📊 Testing Stats Endpoint...")
        
        try:
            response = requests.get(f"{self.api_base}/ai-tools/stats", timeout=30)
            if response.status_code == 200:
                data = response.json()
                if 'total' in data and 'categories' in data and 'sources' in data:
                    self.log_test("GET /api/ai-tools/stats", True, 
                                f"Total: {data['total']}, Categories: {len(data['categories'])}, Sources: {len(data['sources'])}")
                else:
                    self.log_test("GET /api/ai-tools/stats", False, 
                                "Missing stats data in response")
            else:
                self.log_test("GET /api/ai-tools/stats", False, 
                            f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET /api/ai-tools/stats", False, error=str(e))

    def test_status_endpoint(self):
        """Test the status health check endpoint"""
        print("🏥 Testing Status Endpoint...")
        
        try:
            response = requests.get(f"{self.api_base}/status", timeout=30)
            if response.status_code == 200:
                self.log_test("GET /api/status - Health check", True, "Status endpoint responding")
            else:
                self.log_test("GET /api/status - Health check", False, 
                            f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/status - Health check", False, error=str(e))

    def test_data_quality(self):
        """Test data quality and schema validation"""
        print("🔍 Testing Data Quality...")
        
        try:
            response = requests.get(f"{self.api_base}/ai-tools?limit=5", timeout=30)
            if response.status_code == 200:
                data = response.json()
                tools = data.get('tools', [])
                
                if tools:
                    sample_tool = tools[0]
                    required_fields = ['id', 'name', 'tagline', 'description', 'source', 'category', 'pricing', 'rating']
                    missing_fields = [field for field in required_fields if field not in sample_tool]
                    
                    if not missing_fields:
                        self.log_test("Data Quality - Schema validation", True, 
                                    f"All required fields present: {list(sample_tool.keys())}")
                    else:
                        self.log_test("Data Quality - Schema validation", False, 
                                    f"Missing fields: {missing_fields}")
                    
                    # Check for duplicates
                    names = [tool['name'] for tool in tools]
                    if len(names) == len(set(names)):
                        self.log_test("Data Quality - No duplicates", True, 
                                    "No duplicate tool names found")
                    else:
                        self.log_test("Data Quality - No duplicates", False, 
                                    "Duplicate tool names detected")
                else:
                    self.log_test("Data Quality - Schema validation", False, 
                                "No tools available for validation")
            else:
                self.log_test("Data Quality - Schema validation", False, 
                            f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Data Quality - Schema validation", False, error=str(e))

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting HappyTools Enhanced Backend Testing...")
        print(f"🌐 API Base URL: {self.api_base}")
        print("=" * 80)
        
        # Test all endpoints
        self.test_enhanced_ai_tools_endpoint()
        self.test_product_hunt_sync()
        self.test_aitools_fyi_sync()
        self.test_sync_all_sources()
        self.test_trending_endpoint()
        self.test_categories_endpoint()
        self.test_stats_endpoint()
        self.test_status_endpoint()
        self.test_data_quality()
        
        # Summary
        print("=" * 80)
        print("📋 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        print(f"📊 Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['error']}")
        
        print("\n🎉 Testing Complete!")
        return passed == total

if __name__ == "__main__":
    tester = HappyToolsBackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)