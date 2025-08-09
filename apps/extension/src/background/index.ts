// Background service worker for LinkedIn Job Assistant
import { initializeSupabase } from '../utils/supabase';
import { MessageType, Message } from '../utils/types';

// Initialize Supabase connection
const supabase = initializeSupabase();

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep the message channel open for async response
});

async function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) {
  try {
    switch (message.type) {
      case MessageType.SAVE_JOB:
        await saveJobToDatabase(message.data);
        sendResponse({ success: true });
        break;

      case MessageType.GET_JOBS:
        const jobs = await getJobsFromDatabase();
        sendResponse({ success: true, data: jobs });
        break;

      case MessageType.UPDATE_JOB:
        await updateJobInDatabase(message.data);
        sendResponse({ success: true });
        break;

      case MessageType.ANALYZE_JOB:
        const analysis = await analyzeJobMatch(message.data);
        sendResponse({ success: true, data: analysis });
        break;

      case MessageType.GET_USER_PROFILE:
        const profile = await getUserProfile();
        sendResponse({ success: true, data: profile });
        break;

      case MessageType.UPDATE_USER_PROFILE:
        await updateUserProfile(message.data);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Background script error:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
}

async function saveJobToDatabase(jobData: any) {
  const { data, error } = await supabase
    .from('jobs')
    .insert([{
      ...jobData,
      user_id: await getCurrentUserId(),
      created_at: new Date().toISOString(),
      status: 'saved'
    }]);

  if (error) throw error;
  return data;
}

async function getJobsFromDatabase() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', await getCurrentUserId())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function updateJobInDatabase(jobData: any) {
  const { data, error } = await supabase
    .from('jobs')
    .update(jobData)
    .eq('id', jobData.id)
    .eq('user_id', await getCurrentUserId());

  if (error) throw error;
  return data;
}

async function analyzeJobMatch(jobData: any) {
  // Calculate match scores based on user profile and job requirements
  const userProfile = await getUserProfile();
  
  const matchScore = {
    skills: calculateSkillsMatch(userProfile.skills, jobData.required_skills),
    experience: calculateExperienceMatch(userProfile.experience, jobData.experience_required),
    education: calculateEducationMatch(userProfile.education, jobData.education_required),
    location: calculateLocationMatch(userProfile.location, jobData.location),
    overall: 0
  };

  // Calculate overall score (weighted average)
  matchScore.overall = Math.round(
    (matchScore.skills * 0.4) +
    (matchScore.experience * 0.3) +
    (matchScore.education * 0.2) +
    (matchScore.location * 0.1)
  );

  return matchScore;
}

function calculateSkillsMatch(userSkills: string[], requiredSkills: string[]): number {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  
  const matchedSkills = requiredSkills.filter(skill =>
    userSkills.some(userSkill =>
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
}

function calculateExperienceMatch(userExperience: number, requiredExperience: string): number {
  const match = requiredExperience?.match(/(\d+)/);
  if (!match) return 100;
  
  const required = parseInt(match[1]);
  if (userExperience >= required) return 100;
  if (userExperience >= required - 1) return 80;
  if (userExperience >= required - 2) return 60;
  return 40;
}

function calculateEducationMatch(userEducation: string, requiredEducation: string): number {
  if (!requiredEducation) return 100;
  
  const educationLevels = {
    'high school': 1,
    'associate': 2,
    'bachelor': 3,
    'master': 4,
    'phd': 5,
    'doctorate': 5
  };

  const userLevel = Object.entries(educationLevels).find(([key]) =>
    userEducation?.toLowerCase().includes(key)
  )?.[1] || 0;

  const requiredLevel = Object.entries(educationLevels).find(([key]) =>
    requiredEducation.toLowerCase().includes(key)
  )?.[1] || 0;

  if (userLevel >= requiredLevel) return 100;
  if (userLevel === requiredLevel - 1) return 75;
  return 50;
}

function calculateLocationMatch(userLocation: string, jobLocation: string): number {
  if (!jobLocation || jobLocation.toLowerCase().includes('remote')) return 100;
  if (!userLocation) return 50;
  
  // Simple location matching - can be enhanced with geocoding
  if (userLocation.toLowerCase() === jobLocation.toLowerCase()) return 100;
  
  // Check if same city/state
  const userParts = userLocation.toLowerCase().split(',').map(s => s.trim());
  const jobParts = jobLocation.toLowerCase().split(',').map(s => s.trim());
  
  if (userParts.some(part => jobParts.includes(part))) return 75;
  return 25;
}

async function getUserProfile() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', await getCurrentUserId())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || {};
}

async function updateUserProfile(profileData: any) {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      ...profileData,
      user_id: userId,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  return data;
}

async function getCurrentUserId(): Promise<string> {
  // Get current user from Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // If no user, get or create anonymous user
    const storedUserId = await chrome.storage.local.get('userId');
    if (storedUserId.userId) {
      return storedUserId.userId;
    }
    
    // Create anonymous user
    const anonymousId = `anonymous_${Date.now()}`;
    await chrome.storage.local.set({ userId: anonymousId });
    return anonymousId;
  }
  
  return user.id;
}

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Job Assistant installed');
  
  // Set default storage values
  chrome.storage.local.set({
    settings: {
      autoAnalyze: true,
      showMatchScore: true,
      language: 'en'
    }
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url?.includes('linkedin.com')) {
    chrome.tabs.sendMessage(tab.id!, {
      type: MessageType.TOGGLE_PANEL
    });
  }
});