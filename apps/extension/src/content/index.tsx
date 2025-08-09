import React from 'react';
import ReactDOM from 'react-dom/client';
import { JobAnalysisPanel } from './components/JobAnalysisPanel';
import { LinkedInDataExtractor } from './extractor';
import { MessageType } from '../utils/types';
import './styles.css';

class LinkedInJobAssistant {
  private extractor: LinkedInDataExtractor;
  private panelContainer: HTMLElement | null = null;
  private root: ReactDOM.Root | null = null;
  private currentJobData: any = null;

  constructor() {
    this.extractor = new LinkedInDataExtractor();
    this.init();
  }

  private init() {
    // Listen for URL changes
    this.observeUrlChanges();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === MessageType.TOGGLE_PANEL) {
        this.togglePanel();
      }
    });

    // Initialize on job pages
    if (this.isJobPage()) {
      this.injectPanel();
    }
  }

  private observeUrlChanges() {
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        this.handleUrlChange();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  private handleUrlChange() {
    if (this.isJobPage()) {
      setTimeout(() => {
        this.injectPanel();
        this.extractAndAnalyzeJob();
      }, 1000); // Wait for page to load
    } else {
      this.removePanel();
    }
  }

  private isJobPage(): boolean {
    return window.location.pathname.includes('/jobs/view/') ||
           window.location.pathname.includes('/jobs/collections/') ||
           window.location.pathname.includes('/jobs/search/');
  }

  private async injectPanel() {
    // Remove existing panel if any
    this.removePanel();

    // Create container for our panel
    this.panelContainer = document.createElement('div');
    this.panelContainer.id = 'linkedin-job-assistant-panel';
    this.panelContainer.className = 'lja-panel';

    // Find the right place to inject our panel
    const targetElement = this.findTargetElement();
    if (!targetElement) {
      console.log('Target element not found, retrying...');
      setTimeout(() => this.injectPanel(), 1000);
      return;
    }

    targetElement.appendChild(this.panelContainer);

    // Create React root and render panel
    this.root = ReactDOM.createRoot(this.panelContainer);
    this.renderPanel();
  }

  private findTargetElement(): HTMLElement | null {
    // Try different selectors based on LinkedIn's layout
    const selectors = [
      '.jobs-search__job-details',
      '.jobs-job-detail',
      '.job-view-layout',
      'main.scaffold-layout__main',
      '[data-job-id]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element as HTMLElement;
      }
    }

    return document.querySelector('main') as HTMLElement;
  }

  private async extractAndAnalyzeJob() {
    try {
      // Extract job data from the page
      this.currentJobData = this.extractor.extractJobData();
      
      if (!this.currentJobData) {
        console.log('Could not extract job data');
        return;
      }

      // Send to background for analysis
      chrome.runtime.sendMessage({
        type: MessageType.ANALYZE_JOB,
        data: this.currentJobData
      }, (response) => {
        if (response.success) {
          this.currentJobData.match_score = response.data;
          this.renderPanel();
        }
      });
    } catch (error) {
      console.error('Error extracting job data:', error);
    }
  }

  private renderPanel() {
    if (!this.root || !this.currentJobData) return;

    this.root.render(
      <JobAnalysisPanel
        jobData={this.currentJobData}
        onSave={this.handleSaveJob.bind(this)}
        onClose={this.removePanel.bind(this)}
      />
    );
  }

  private async handleSaveJob() {
    if (!this.currentJobData) return;

    chrome.runtime.sendMessage({
      type: MessageType.SAVE_JOB,
      data: this.currentJobData
    }, (response) => {
      if (response.success) {
        console.log('Job saved successfully');
        // Update UI to show saved state
        this.renderPanel();
      }
    });
  }

  private togglePanel() {
    if (this.panelContainer) {
      this.panelContainer.style.display = 
        this.panelContainer.style.display === 'none' ? 'block' : 'none';
    }
  }

  private removePanel() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.panelContainer) {
      this.panelContainer.remove();
      this.panelContainer = null;
    }
  }
}

// Initialize the assistant
new LinkedInJobAssistant();