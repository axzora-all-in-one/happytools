#!/usr/bin/env python3

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://5a5ec5e8-53c8-414a-b9f3-a129d031fec1.preview.emergentagent.com/api"
HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

class BackendTester:
    def __init__(self):
        self.passed_tests = 0
        self.failed_tests = 0
        self.test_results = []
        
    def log_test(self, test_name, passed, message=""):
        status = "✅ PASSED" if passed else "❌ FAILED"
        result = f"{status} - {test_name}"
        if message:
            result += f": {message}"
        print(result)
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'message': message
        })
        
        if passed:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
    
    def test_new_professional_agents(self):
        """Test all 10 new professional AI agents"""
        print("\n" + "="*80)
        print("TESTING NEW PROFESSIONAL AI AGENTS")
        print("="*80)
        
        # Test 1: Introduction Email Generator
        print("\n--- Testing Introduction Email Generator ---")
        try:
            payload = {
                "agentId": "intro-email",
                "inputs": {
                    "person1": "Sarah Johnson",
                    "person2": "Michael Chen", 
                    "purpose": "Sarah is a marketing expert who could help Michael with his startup's growth strategy",
                    "context": "Both are passionate about sustainable technology and could benefit from collaborating"
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'result' in data:
                    result = data['result']
                    if 'Sarah Johnson' in result and 'Michael Chen' in result and 'Subject:' in result:
                        self.log_test("Introduction Email Generator", True, "Generated professional introduction email with proper structure")
                    else:
                        self.log_test("Introduction Email Generator", False, "Email content missing required elements")
                else:
                    self.log_test("Introduction Email Generator", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Introduction Email Generator", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Introduction Email Generator", False, f"Exception: {str(e)}")
        
        # Test 2: Follow-Up Writer (without API key)
        print("\n--- Testing Follow-Up Writer (No API Key) ---")
        try:
            payload = {
                "agentId": "follow-up-writer",
                "inputs": {
                    "previousEmail": "Hi John, I wanted to discuss the marketing proposal we talked about last week.",
                    "recipient": "John Smith",
                    "purpose": "Check Status"
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Please provide your OpenAI API key' in data.get('result', ''):
                    self.log_test("Follow-Up Writer (No API Key)", True, "Correctly requests OpenAI API key")
                else:
                    self.log_test("Follow-Up Writer (No API Key)", False, f"Unexpected response: {data}")
            else:
                self.log_test("Follow-Up Writer (No API Key)", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Follow-Up Writer (No API Key)", False, f"Exception: {str(e)}")
        
        # Test 3: Follow-Up Writer (with fake API key)
        print("\n--- Testing Follow-Up Writer (With Fake API Key) ---")
        try:
            payload = {
                "agentId": "follow-up-writer",
                "inputs": {
                    "apiKey": "fake-api-key-for-testing",
                    "previousEmail": "Hi John, I wanted to discuss the marketing proposal we talked about last week.",
                    "recipient": "John Smith",
                    "purpose": "Check Status"
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Error generating follow-up email' in data.get('result', ''):
                    self.log_test("Follow-Up Writer (Fake API Key)", True, "Correctly handles invalid API key with error message")
                else:
                    self.log_test("Follow-Up Writer (Fake API Key)", False, f"Unexpected response: {data}")
            else:
                self.log_test("Follow-Up Writer (Fake API Key)", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Follow-Up Writer (Fake API Key)", False, f"Exception: {str(e)}")
        
        # Test 4: Stock Finder (without API key - should show demo data)
        print("\n--- Testing Stock Finder (Demo Mode) ---")
        try:
            payload = {
                "agentId": "stock-finder",
                "inputs": {
                    "market": "US",
                    "timeframe": "Today"
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'result' in data:
                    result = data['result']
                    if 'Demo Data' in result and 'AAPL' in result and 'TSLA' in result:
                        self.log_test("Stock Finder (Demo Mode)", True, "Shows demo stock data correctly")
                    else:
                        self.log_test("Stock Finder (Demo Mode)", False, "Demo data format incorrect")
                else:
                    self.log_test("Stock Finder (Demo Mode)", False, f"Invalid response: {data}")
            else:
                self.log_test("Stock Finder (Demo Mode)", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Stock Finder (Demo Mode)", False, f"Exception: {str(e)}")
        
        # Test 5: Crypto Market Pulse
        print("\n--- Testing Crypto Market Pulse ---")
        try:
            payload = {
                "agentId": "crypto-pulse",
                "inputs": {
                    "focus": "Top 10",
                    "timeframe": "24h"
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'result' in data:
                    result = data['result']
                    if 'Bitcoin (BTC)' in result and 'Ethereum (ETH)' in result and 'Market Cap' in result:
                        self.log_test("Crypto Market Pulse", True, "Shows comprehensive crypto market data")
                    else:
                        self.log_test("Crypto Market Pulse", False, "Crypto data format incorrect")
                else:
                    self.log_test("Crypto Market Pulse", False, f"Invalid response: {data}")
            else:
                self.log_test("Crypto Market Pulse", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Crypto Market Pulse", False, f"Exception: {str(e)}")
        
        # Test 6: AI Detector (without API key)
        print("\n--- Testing AI Detector (No API Key) ---")
        try:
            payload = {
                "agentId": "ai-detector",
                "inputs": {
                    "text": "This is a sample text that needs to be analyzed for AI detection purposes."
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Please provide your OpenAI API key' in data.get('result', ''):
                    self.log_test("AI Detector (No API Key)", True, "Correctly requests OpenAI API key")
                else:
                    self.log_test("AI Detector (No API Key)", False, f"Unexpected response: {data}")
            else:
                self.log_test("AI Detector (No API Key)", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("AI Detector (No API Key)", False, f"Exception: {str(e)}")
        
        # Test 7: SEO Blog Writer (without API key)
        print("\n--- Testing SEO Blog Writer (No API Key) ---")
        try:
            payload = {
                "agentId": "seo-writer",
                "inputs": {
                    "topic": "Benefits of AI in Modern Business",
                    "keywords": "artificial intelligence, business automation, productivity",
                    "length": "Medium (1000 words)",
                    "tone": "Professional"
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Please provide your OpenAI API key' in data.get('result', ''):
                    self.log_test("SEO Blog Writer (No API Key)", True, "Correctly requests OpenAI API key")
                else:
                    self.log_test("SEO Blog Writer (No API Key)", False, f"Unexpected response: {data}")
            else:
                self.log_test("SEO Blog Writer (No API Key)", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("SEO Blog Writer (No API Key)", False, f"Exception: {str(e)}")
        
        # Test 8: PDF Explainer (without API key)
        print("\n--- Testing PDF Explainer (No API Key) ---")
        try:
            payload = {
                "agentId": "pdf-explainer",
                "inputs": {
                    "pdfText": "This is sample PDF content about quarterly business results and strategic planning for the next fiscal year.",
                    "task": "Summary"
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Please provide your OpenAI API key' in data.get('result', ''):
                    self.log_test("PDF Explainer (No API Key)", True, "Correctly requests OpenAI API key")
                else:
                    self.log_test("PDF Explainer (No API Key)", False, f"Unexpected response: {data}")
            else:
                self.log_test("PDF Explainer (No API Key)", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("PDF Explainer (No API Key)", False, f"Exception: {str(e)}")
        
        # Test 9: Fine Print Checker (without API key)
        print("\n--- Testing Fine Print Checker (No API Key) ---")
        try:
            payload = {
                "agentId": "fine-print-checker",
                "inputs": {
                    "document": "This software license agreement grants you limited rights to use the software. The company reserves the right to terminate this license at any time without notice.",
                    "focus": "All Issues"
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Please provide your OpenAI API key' in data.get('result', ''):
                    self.log_test("Fine Print Checker (No API Key)", True, "Correctly requests OpenAI API key")
                else:
                    self.log_test("Fine Print Checker (No API Key)", False, f"Unexpected response: {data}")
            else:
                self.log_test("Fine Print Checker (No API Key)", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Fine Print Checker (No API Key)", False, f"Exception: {str(e)}")
        
        # Test 10: Clara Coach (without API key)
        print("\n--- Testing Clara Coach (No API Key) ---")
        try:
            payload = {
                "agentId": "clara-coach",
                "inputs": {
                    "situation": "I'm feeling overwhelmed with work and struggling to maintain work-life balance",
                    "mood": "Stressed",
                    "goal": "Better time management"
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Please provide your OpenAI API key' in data.get('result', ''):
                    self.log_test("Clara Coach (No API Key)", True, "Correctly requests OpenAI API key")
                else:
                    self.log_test("Clara Coach (No API Key)", False, f"Unexpected response: {data}")
            else:
                self.log_test("Clara Coach (No API Key)", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Clara Coach (No API Key)", False, f"Exception: {str(e)}")
    
    def test_enhanced_scraping(self):
        """Test enhanced scraping functionality"""
        print("\n" + "="*80)
        print("TESTING ENHANCED SCRAPING FUNCTIONALITY")
        print("="*80)
        
        # Test 1: Enhanced AITools.fyi scraper
        print("\n--- Testing Enhanced AITools.fyi Scraper ---")
        try:
            response = requests.post(f"{BASE_URL}/ai-tools/sync-aitools", headers=HEADERS, timeout=120)
            
            if response.status_code == 200:
                data = response.json()
                if 'synced' in data and 'total_found' in data and 'categories_scraped' in data:
                    synced = data['synced']
                    total_found = data['total_found']
                    categories = data['categories_scraped']
                    
                    if total_found > 0 and categories > 50:  # Should scrape 60+ categories
                        self.log_test("Enhanced AITools.fyi Scraper", True, f"Scraped {total_found} tools from {categories} categories")
                    else:
                        self.log_test("Enhanced AITools.fyi Scraper", False, f"Insufficient scraping: {total_found} tools, {categories} categories")
                else:
                    self.log_test("Enhanced AITools.fyi Scraper", False, f"Invalid response format: {data}")
            else:
                self.log_test("Enhanced AITools.fyi Scraper", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Enhanced AITools.fyi Scraper", False, f"Exception: {str(e)}")
        
        # Test 2: Verify scraped data quality
        print("\n--- Testing Scraped Data Quality ---")
        try:
            response = requests.get(f"{BASE_URL}/ai-tools?limit=50", headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if 'tools' in data and len(data['tools']) > 0:
                    tools = data['tools']
                    
                    # Check for diverse categories
                    categories = set(tool.get('category', '') for tool in tools)
                    aitools_source = any(tool.get('source') == 'AITools.fyi' for tool in tools)
                    google_trending = any(tool.get('source') == 'Google Trending' for tool in tools)
                    
                    if len(categories) > 10 and aitools_source:
                        self.log_test("Scraped Data Quality", True, f"Found {len(categories)} categories with AITools.fyi and Google trending sources")
                    else:
                        self.log_test("Scraped Data Quality", False, f"Limited diversity: {len(categories)} categories, AITools.fyi: {aitools_source}, Google: {google_trending}")
                else:
                    self.log_test("Scraped Data Quality", False, "No tools found in database")
            else:
                self.log_test("Scraped Data Quality", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Scraped Data Quality", False, f"Exception: {str(e)}")
        
        # Test 3: Test stats endpoint with enhanced data
        print("\n--- Testing Stats with Enhanced Data ---")
        try:
            response = requests.get(f"{BASE_URL}/ai-tools/stats", headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if 'total' in data and 'categories' in data and 'sources' in data:
                    total = data['total']
                    categories = len(data['categories'])
                    sources = len(data['sources'])
                    
                    if total > 100 and categories > 15:  # Should have many tools and categories
                        self.log_test("Stats with Enhanced Data", True, f"Total: {total} tools, {categories} categories, {sources} sources")
                    else:
                        self.log_test("Stats with Enhanced Data", False, f"Insufficient data: {total} tools, {categories} categories")
                else:
                    self.log_test("Stats with Enhanced Data", False, f"Invalid stats format: {data}")
            else:
                self.log_test("Stats with Enhanced Data", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Stats with Enhanced Data", False, f"Exception: {str(e)}")
    
    def test_input_validation(self):
        """Test input validation for new agents"""
        print("\n" + "="*80)
        print("TESTING INPUT VALIDATION")
        print("="*80)
        
        # Test 1: Missing required inputs for intro-email
        print("\n--- Testing Input Validation: Missing Required Fields ---")
        try:
            payload = {
                "agentId": "intro-email",
                "inputs": {
                    "person1": "Sarah Johnson"
                    # Missing person2 and purpose
                }
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Please provide both person names and introduction purpose' in data.get('result', ''):
                    self.log_test("Input Validation: Missing Fields", True, "Correctly validates required fields")
                else:
                    self.log_test("Input Validation: Missing Fields", False, f"Validation failed: {data}")
            else:
                self.log_test("Input Validation: Missing Fields", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Input Validation: Missing Fields", False, f"Exception: {str(e)}")
        
        # Test 2: Invalid agent ID
        print("\n--- Testing Invalid Agent ID ---")
        try:
            payload = {
                "agentId": "non-existent-agent",
                "inputs": {}
            }
            
            response = requests.post(f"{BASE_URL}/agents/run", json=payload, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'Unknown agent type' in data.get('result', ''):
                    self.log_test("Invalid Agent ID", True, "Correctly handles unknown agent types")
                else:
                    self.log_test("Invalid Agent ID", False, f"Unexpected response: {data}")
            else:
                self.log_test("Invalid Agent ID", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Agent ID", False, f"Exception: {str(e)}")
        
        # Test 3: Malformed JSON
        print("\n--- Testing Malformed JSON ---")
        try:
            malformed_json = '{"agentId": "intro-email", "inputs": {'
            response = requests.post(f"{BASE_URL}/agents/run", data=malformed_json, headers=HEADERS)
            
            if response.status_code == 500:
                self.log_test("Malformed JSON", True, "Correctly handles malformed JSON with 500 error")
            else:
                self.log_test("Malformed JSON", False, f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Malformed JSON", True, f"Exception correctly caught: {str(e)}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 STARTING COMPREHENSIVE BACKEND TESTING")
        print("="*80)
        print(f"Testing Backend URL: {BASE_URL}")
        print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run all test suites
        self.test_new_professional_agents()
        self.test_enhanced_scraping()
        self.test_input_validation()
        
        # Print final summary
        print("\n" + "="*80)
        print("FINAL TEST SUMMARY")
        print("="*80)
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"📊 Success Rate: {(self.passed_tests / (self.passed_tests + self.failed_tests) * 100):.1f}%")
        print(f"🕒 Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if self.failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! The enhanced HappyTools backend is working perfectly!")
        else:
            print(f"\n⚠️  {self.failed_tests} tests failed. Review the issues above.")
        
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)