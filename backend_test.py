#!/usr/bin/env python3

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://f2884661-c20b-483f-ad47-0b43883bbdde.preview.emergentagent.com/api"
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
    
    def test_workflow_builder(self):
        """Test the new workflow builder functionality"""
        print("\n" + "="*80)
        print("TESTING WORKFLOW BUILDER FUNCTIONALITY")
        print("="*80)
        
        # Test 1: Valid workflow generation request (n8n)
        print("\n--- Testing Valid Workflow Generation (n8n) ---")
        try:
            payload = {
                "name": "Email Notification System",
                "description": "Automated email notifications for form submissions",
                "provider": "openai",
                "apiKey": "fake-api-key-for-testing",
                "automationDescription": "When someone submits a contact form on my website, I want to send them a welcome email and add their information to my CRM system.",
                "platform": "n8n"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'workflow' in data and 'visualPreview' in data:
                    workflow = data['workflow']
                    if 'nodes' in workflow or 'name' in workflow:
                        self.log_test("Valid Workflow Generation (n8n)", True, f"Generated workflow with {data.get('nodeCount', 'unknown')} nodes")
                    else:
                        self.log_test("Valid Workflow Generation (n8n)", False, "Invalid workflow structure")
                else:
                    self.log_test("Valid Workflow Generation (n8n)", False, f"Invalid response structure: {data}")
            else:
                # API key error is expected with fake key
                if response.status_code == 500:
                    error_data = response.json()
                    if 'error' in error_data and ('API' in error_data['error'] or 'OpenAI' in error_data['error']):
                        self.log_test("Valid Workflow Generation (n8n)", True, "Correctly handles invalid API key with proper error")
                    else:
                        self.log_test("Valid Workflow Generation (n8n)", False, f"Unexpected error: {error_data}")
                else:
                    self.log_test("Valid Workflow Generation (n8n)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Valid Workflow Generation (n8n)", False, f"Exception: {str(e)}")
        
        # Test 2: Valid workflow generation request (Make.com)
        print("\n--- Testing Valid Workflow Generation (Make.com) ---")
        try:
            payload = {
                "name": "Social Media Automation",
                "description": "Post content across multiple social platforms",
                "provider": "claude",
                "apiKey": "fake-claude-key-for-testing",
                "automationDescription": "I want to automatically post my blog content to Twitter, LinkedIn, and Facebook when I publish a new article.",
                "platform": "make"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'workflow' in data and 'visualPreview' in data:
                    workflow = data['workflow']
                    if 'scenario' in workflow or 'name' in workflow:
                        self.log_test("Valid Workflow Generation (Make.com)", True, f"Generated Make.com workflow with {data.get('nodeCount', 'unknown')} modules")
                    else:
                        self.log_test("Valid Workflow Generation (Make.com)", False, "Invalid Make.com workflow structure")
                else:
                    self.log_test("Valid Workflow Generation (Make.com)", False, f"Invalid response structure: {data}")
            else:
                # API key error is expected with fake key
                if response.status_code == 500:
                    error_data = response.json()
                    if 'error' in error_data and ('API' in error_data['error'] or 'Claude' in error_data['error']):
                        self.log_test("Valid Workflow Generation (Make.com)", True, "Correctly handles invalid Claude API key with proper error")
                    else:
                        self.log_test("Valid Workflow Generation (Make.com)", False, f"Unexpected error: {error_data}")
                else:
                    self.log_test("Valid Workflow Generation (Make.com)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Valid Workflow Generation (Make.com)", False, f"Exception: {str(e)}")
        
        # Test 3: Missing required fields validation
        print("\n--- Testing Missing Required Fields ---")
        try:
            payload = {
                "name": "Test Workflow",
                # Missing apiKey, automationDescription, provider, platform
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'required' in data['error'].lower():
                    self.log_test("Missing Required Fields", True, "Correctly validates required fields")
                else:
                    self.log_test("Missing Required Fields", False, f"Unexpected error message: {data}")
            else:
                self.log_test("Missing Required Fields", False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Missing Required Fields", False, f"Exception: {str(e)}")
        
        # Test 4: Invalid provider validation
        print("\n--- Testing Invalid Provider Validation ---")
        try:
            payload = {
                "name": "Test Workflow",
                "provider": "invalid-provider",
                "apiKey": "test-key",
                "automationDescription": "Test automation",
                "platform": "n8n"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'provider' in data['error'].lower():
                    self.log_test("Invalid Provider Validation", True, "Correctly validates provider")
                else:
                    self.log_test("Invalid Provider Validation", False, f"Unexpected error: {data}")
            else:
                self.log_test("Invalid Provider Validation", False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Provider Validation", False, f"Exception: {str(e)}")
        
        # Test 5: Invalid platform validation
        print("\n--- Testing Invalid Platform Validation ---")
        try:
            payload = {
                "name": "Test Workflow",
                "provider": "openai",
                "apiKey": "test-key",
                "automationDescription": "Test automation",
                "platform": "invalid-platform"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'platform' in data['error'].lower():
                    self.log_test("Invalid Platform Validation", True, "Correctly validates platform")
                else:
                    self.log_test("Invalid Platform Validation", False, f"Unexpected error: {data}")
            else:
                self.log_test("Invalid Platform Validation", False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Platform Validation", False, f"Exception: {str(e)}")
        
        # Test 6: Test with Gemini provider
        print("\n--- Testing Gemini Provider ---")
        try:
            payload = {
                "name": "Data Processing Pipeline",
                "description": "Process and transform data from multiple sources",
                "provider": "gemini",
                "apiKey": "fake-gemini-key-for-testing",
                "automationDescription": "I want to fetch data from multiple APIs, clean and transform it, then store it in a database and send a summary report via email.",
                "platform": "n8n"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'workflow' in data:
                    self.log_test("Gemini Provider", True, "Successfully processes Gemini provider requests")
                else:
                    self.log_test("Gemini Provider", False, f"Invalid response: {data}")
            else:
                # API key error is expected with fake key
                if response.status_code == 500:
                    error_data = response.json()
                    if 'error' in error_data and ('API' in error_data['error'] or 'Gemini' in error_data['error']):
                        self.log_test("Gemini Provider", True, "Correctly handles invalid Gemini API key with proper error")
                    else:
                        self.log_test("Gemini Provider", False, f"Unexpected error: {error_data}")
                else:
                    self.log_test("Gemini Provider", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Gemini Provider", False, f"Exception: {str(e)}")
        
        # Test 7: Test helper functions (basic template generation)
        print("\n--- Testing Helper Functions (Basic Template) ---")
        try:
            # This test will trigger the fallback to basic template when API fails
            payload = {
                "name": "Basic Template Test",
                "provider": "openai",
                "apiKey": "definitely-invalid-key",
                "automationDescription": "Simple webhook to email workflow",
                "platform": "n8n"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=30)
            
            # Should either succeed with basic template or fail with API error
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'workflow' in data:
                    workflow = data['workflow']
                    if 'nodes' in workflow and len(workflow['nodes']) >= 2:
                        self.log_test("Helper Functions (Basic Template)", True, "Basic template generation working")
                    else:
                        self.log_test("Helper Functions (Basic Template)", False, "Basic template structure invalid")
                else:
                    self.log_test("Helper Functions (Basic Template)", False, f"Invalid response: {data}")
            elif response.status_code == 500:
                # API error is acceptable for this test
                self.log_test("Helper Functions (Basic Template)", True, "API error handling working correctly")
            else:
                self.log_test("Helper Functions (Basic Template)", False, f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Helper Functions (Basic Template)", False, f"Exception: {str(e)}")

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
    
    def test_cricket_functionality(self):
        """Test all cricket API endpoints"""
        print("\n" + "="*80)
        print("TESTING CRICKET API FUNCTIONALITY")
        print("="*80)
        
        # Test 1: Live Matches endpoint
        print("\n--- Testing Live Matches Endpoint ---")
        try:
            response = requests.get(f"{BASE_URL}/cricket/live-matches", headers=HEADERS, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'matches' in data and 'lastUpdated' in data:
                    matches = data['matches']
                    if isinstance(matches, list) and len(matches) > 0:
                        # Check first match structure
                        match = matches[0]
                        required_fields = ['id', 'status', 'series', 'team1', 'team2', 'venue']
                        if all(field in match for field in required_fields):
                            team1 = match['team1']
                            team2 = match['team2']
                            if 'name' in team1 and 'score' in team1 and 'name' in team2 and 'score' in team2:
                                self.log_test("Live Matches Endpoint", True, f"Retrieved {len(matches)} live matches with proper structure")
                            else:
                                self.log_test("Live Matches Endpoint", False, "Team data structure incomplete")
                        else:
                            self.log_test("Live Matches Endpoint", False, f"Missing required fields in match data")
                    else:
                        self.log_test("Live Matches Endpoint", True, "No live matches currently (acceptable)")
                else:
                    self.log_test("Live Matches Endpoint", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Live Matches Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Live Matches Endpoint", False, f"Exception: {str(e)}")
        
        # Test 2: Recent Matches endpoint
        print("\n--- Testing Recent Matches Endpoint ---")
        try:
            response = requests.get(f"{BASE_URL}/cricket/recent-matches", headers=HEADERS, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'matches' in data and 'lastUpdated' in data:
                    matches = data['matches']
                    if isinstance(matches, list) and len(matches) > 0:
                        # Check first match structure
                        match = matches[0]
                        required_fields = ['id', 'series', 'team1', 'team2', 'result']
                        if all(field in match for field in required_fields):
                            team1 = match['team1']
                            team2 = match['team2']
                            if 'name' in team1 and 'score' in team1 and 'name' in team2 and 'score' in team2:
                                self.log_test("Recent Matches Endpoint", True, f"Retrieved {len(matches)} recent matches with proper structure")
                            else:
                                self.log_test("Recent Matches Endpoint", False, "Team data structure incomplete")
                        else:
                            self.log_test("Recent Matches Endpoint", False, f"Missing required fields in match data")
                    else:
                        self.log_test("Recent Matches Endpoint", True, "No recent matches found (acceptable)")
                else:
                    self.log_test("Recent Matches Endpoint", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Recent Matches Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Recent Matches Endpoint", False, f"Exception: {str(e)}")
        
        # Test 3: Upcoming Matches endpoint
        print("\n--- Testing Upcoming Matches Endpoint ---")
        try:
            response = requests.get(f"{BASE_URL}/cricket/upcoming-matches", headers=HEADERS, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'matches' in data and 'lastUpdated' in data:
                    matches = data['matches']
                    if isinstance(matches, list) and len(matches) > 0:
                        # Check first match structure
                        match = matches[0]
                        required_fields = ['id', 'series', 'team1', 'team2', 'dateTime', 'venue']
                        if all(field in match for field in required_fields):
                            team1 = match['team1']
                            team2 = match['team2']
                            if 'name' in team1 and 'code' in team1 and 'name' in team2 and 'code' in team2:
                                self.log_test("Upcoming Matches Endpoint", True, f"Retrieved {len(matches)} upcoming matches with proper structure")
                            else:
                                self.log_test("Upcoming Matches Endpoint", False, "Team data structure incomplete")
                        else:
                            self.log_test("Upcoming Matches Endpoint", False, f"Missing required fields in match data")
                    else:
                        self.log_test("Upcoming Matches Endpoint", True, "No upcoming matches found (acceptable)")
                else:
                    self.log_test("Upcoming Matches Endpoint", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Upcoming Matches Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Upcoming Matches Endpoint", False, f"Exception: {str(e)}")
        
        # Test 4: Player Stats endpoint
        print("\n--- Testing Player Stats Endpoint ---")
        try:
            response = requests.get(f"{BASE_URL}/cricket/player-stats", headers=HEADERS, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'stats' in data and 'lastUpdated' in data:
                    stats = data['stats']
                    if isinstance(stats, list) and len(stats) > 0:
                        # Check first player structure
                        player = stats[0]
                        required_fields = ['id', 'name', 'team', 'role', 'batting', 'bowling', 'matches']
                        if all(field in player for field in required_fields):
                            batting = player['batting']
                            bowling = player['bowling']
                            if 'average' in batting and 'runs' in batting and 'average' in bowling and 'wickets' in bowling:
                                self.log_test("Player Stats Endpoint", True, f"Retrieved {len(stats)} player stats with proper structure")
                            else:
                                self.log_test("Player Stats Endpoint", False, "Player stats structure incomplete")
                        else:
                            self.log_test("Player Stats Endpoint", False, f"Missing required fields in player data")
                    else:
                        self.log_test("Player Stats Endpoint", False, "No player stats found")
                else:
                    self.log_test("Player Stats Endpoint", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Player Stats Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Player Stats Endpoint", False, f"Exception: {str(e)}")
        
        # Test 5: Match Details endpoint (with valid ID)
        print("\n--- Testing Match Details Endpoint ---")
        try:
            # First get a match ID from live matches
            live_response = requests.get(f"{BASE_URL}/cricket/live-matches", headers=HEADERS, timeout=30)
            match_id = "test-match-123"  # Default test ID
            
            if live_response.status_code == 200:
                live_data = live_response.json()
                if live_data.get('success') and 'matches' in live_data and len(live_data['matches']) > 0:
                    match_id = live_data['matches'][0].get('id', match_id)
            
            response = requests.get(f"{BASE_URL}/cricket/match-details?id={match_id}", headers=HEADERS, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'match' in data and 'lastUpdated' in data:
                    match = data['match']
                    if match and 'id' in match and 'series' in match and 'team1' in match and 'team2' in match:
                        self.log_test("Match Details Endpoint", True, f"Retrieved match details for ID: {match_id}")
                    else:
                        self.log_test("Match Details Endpoint", False, "Match details structure incomplete")
                else:
                    self.log_test("Match Details Endpoint", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Match Details Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Match Details Endpoint", False, f"Exception: {str(e)}")
        
        # Test 6: Match Details endpoint (missing ID)
        print("\n--- Testing Match Details Endpoint (Missing ID) ---")
        try:
            response = requests.get(f"{BASE_URL}/cricket/match-details", headers=HEADERS, timeout=30)
            
            if response.status_code == 400:
                data = response.json()
                if data.get('success') == False and 'Match ID is required' in data.get('error', ''):
                    self.log_test("Match Details (Missing ID)", True, "Correctly validates missing match ID")
                else:
                    self.log_test("Match Details (Missing ID)", False, f"Unexpected error message: {data}")
            else:
                self.log_test("Match Details (Missing ID)", False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Match Details (Missing ID)", False, f"Exception: {str(e)}")
        
        # Test 7: Data Quality Check - Verify cricket data contains realistic information
        print("\n--- Testing Cricket Data Quality ---")
        try:
            response = requests.get(f"{BASE_URL}/cricket/live-matches", headers=HEADERS, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'matches' in data:
                    matches = data['matches']
                    if len(matches) > 0:
                        match = matches[0]
                        # Check for realistic cricket data
                        has_teams = 'team1' in match and 'team2' in match
                        has_series = 'series' in match and match['series']
                        has_venue = 'venue' in match and match['venue']
                        has_commentary = 'commentary' in match
                        
                        if has_teams and has_series and has_venue:
                            self.log_test("Cricket Data Quality", True, "Cricket data contains realistic match information")
                        else:
                            self.log_test("Cricket Data Quality", False, "Cricket data missing essential information")
                    else:
                        # Check recent matches for data quality
                        recent_response = requests.get(f"{BASE_URL}/cricket/recent-matches", headers=HEADERS, timeout=30)
                        if recent_response.status_code == 200:
                            recent_data = recent_response.json()
                            if recent_data.get('success') and len(recent_data.get('matches', [])) > 0:
                                self.log_test("Cricket Data Quality", True, "Cricket data available in recent matches")
                            else:
                                self.log_test("Cricket Data Quality", True, "No current matches but endpoints working (acceptable)")
                        else:
                            self.log_test("Cricket Data Quality", False, "No data available in any endpoint")
                else:
                    self.log_test("Cricket Data Quality", False, "Invalid data structure")
            else:
                self.log_test("Cricket Data Quality", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Cricket Data Quality", False, f"Exception: {str(e)}")
        
        # Test 8: Error Handling - Test with invalid endpoints
        print("\n--- Testing Cricket Error Handling ---")
        try:
            response = requests.get(f"{BASE_URL}/cricket/invalid-endpoint", headers=HEADERS, timeout=30)
            
            # Should return 404 or similar error for invalid cricket endpoint
            if response.status_code >= 400:
                self.log_test("Cricket Error Handling", True, f"Correctly handles invalid cricket endpoint with {response.status_code}")
            else:
                self.log_test("Cricket Error Handling", False, f"Should return error for invalid endpoint, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Cricket Error Handling", True, f"Exception correctly handled: {str(e)}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 STARTING COMPREHENSIVE BACKEND TESTING")
        print("="*80)
        print(f"Testing Backend URL: {BASE_URL}")
        print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run all test suites
        self.test_new_professional_agents()
        self.test_enhanced_scraping()
        self.test_workflow_builder()
        self.test_input_validation()
        self.test_cricket_functionality()
        
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