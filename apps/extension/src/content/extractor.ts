import { LinkedInJobData, LinkedInProfileData } from '../utils/types';

export class LinkedInDataExtractor {
  extractJobData(): LinkedInJobData | null {
    try {
      // Get job URL
      const url = window.location.href;

      // Extract job title
      const titleElement = document.querySelector('h1.job-details-jobs-unified-top-card__job-title') ||
                          document.querySelector('h1.jobs-unified-top-card__job-title') ||
                          document.querySelector('h1');
      const title = titleElement?.textContent?.trim() || '';

      // Extract company name
      const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name') ||
                            document.querySelector('.jobs-unified-top-card__company-name') ||
                            document.querySelector('[data-test-job-card-company-name]');
      const company = companyElement?.textContent?.trim() || '';

      // Extract location
      const locationElement = document.querySelector('.job-details-jobs-unified-top-card__bullet') ||
                             document.querySelector('.jobs-unified-top-card__bullet') ||
                             document.querySelector('[data-test-job-card-location]');
      const location = locationElement?.textContent?.trim() || '';

      // Extract job description
      const descriptionElement = document.querySelector('.jobs-description__content') ||
                                document.querySelector('.job-details-jobs-unified-top-card__job-insight') ||
                                document.querySelector('[data-test-job-description]');
      const description = descriptionElement?.textContent?.trim() || '';

      // Extract job type
      const jobTypeElement = document.querySelector('.job-details-jobs-unified-top-card__job-insight-view-model');
      const jobType = this.extractJobType(jobTypeElement?.textContent || '');

      // Extract experience level
      const experienceLevel = this.extractExperienceLevel(description);

      // Extract posted date
      const postedElement = document.querySelector('.jobs-unified-top-card__posted-date') ||
                           document.querySelector('[data-test-job-card-date]');
      const postedDate = postedElement?.textContent?.trim() || '';

      // Extract number of applicants
      const applicantsElement = document.querySelector('.jobs-unified-top-card__applicant-count') ||
                               document.querySelector('[data-test-job-card-applicant-count]');
      const applicantsText = applicantsElement?.textContent?.trim() || '';
      const applicants = this.extractApplicantCount(applicantsText);

      // Check if Easy Apply is available
      const isEasyApply = !!document.querySelector('.jobs-apply-button--easy-apply') ||
                         !!document.querySelector('[data-test-job-card-easy-apply]');

      return {
        url,
        title,
        company,
        location,
        description,
        jobType,
        experienceLevel,
        postedDate,
        applicants,
        isEasyApply
      };
    } catch (error) {
      console.error('Error extracting job data:', error);
      return null;
    }
  }

  extractProfileData(): LinkedInProfileData | null {
    try {
      // Extract name
      const nameElement = document.querySelector('.text-heading-xlarge') ||
                         document.querySelector('h1.inline');
      const name = nameElement?.textContent?.trim() || '';

      // Extract headline
      const headlineElement = document.querySelector('.text-body-medium') ||
                             document.querySelector('[data-test-profile-headline]');
      const headline = headlineElement?.textContent?.trim() || '';

      // Extract location
      const locationElement = document.querySelector('.text-body-small.inline') ||
                             document.querySelector('[data-test-profile-location]');
      const location = locationElement?.textContent?.trim() || '';

      // Extract about section
      const aboutElement = document.querySelector('#about')?.parentElement?.querySelector('.inline-show-more-text');
      const about = aboutElement?.textContent?.trim() || '';

      // Extract experience
      const experience = this.extractExperience();

      // Extract education
      const education = this.extractEducation();

      // Extract skills
      const skills = this.extractSkills();

      // Extract certifications
      const certifications = this.extractCertifications();

      // Check profile completeness
      const profilePhoto = !!document.querySelector('.profile-photo-edit__preview');
      const banner = !!document.querySelector('.profile-background-image');
      const customUrl = window.location.pathname.includes('/in/') && 
                       !window.location.pathname.match(/\/in\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
      const openToWork = !!document.querySelector('.profile-badge--open-to-work');

      return {
        name,
        headline,
        location,
        about,
        experience,
        education,
        skills,
        certifications,
        profilePhoto,
        banner,
        customUrl,
        openToWork
      };
    } catch (error) {
      console.error('Error extracting profile data:', error);
      return null;
    }
  }

  private extractJobType(text: string): string {
    const types = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Volunteer'];
    for (const type of types) {
      if (text.includes(type)) {
        return type;
      }
    }
    return 'Full-time';
  }

  private extractExperienceLevel(description: string): string {
    const levels = {
      'Entry level': ['entry', 'junior', '0-2 years', 'graduate'],
      'Mid-Senior level': ['senior', 'lead', '5+ years', '7+ years'],
      'Associate': ['associate', '2-5 years'],
      'Director': ['director', 'head of'],
      'Executive': ['executive', 'vp', 'vice president', 'c-level', 'ceo', 'cto', 'cfo']
    };

    const lowerDesc = description.toLowerCase();
    for (const [level, keywords] of Object.entries(levels)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        return level;
      }
    }
    return 'Not specified';
  }

  private extractApplicantCount(text: string): number {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractExperience(): any[] {
    const experiences: any[] = [];
    const experienceSection = document.querySelector('#experience')?.parentElement;
    if (!experienceSection) return experiences;

    const experienceItems = experienceSection.querySelectorAll('li.artdeco-list__item');
    experienceItems.forEach(item => {
      const titleElement = item.querySelector('[data-test-experience-title]') ||
                          item.querySelector('.t-bold span[aria-hidden="true"]');
      const companyElement = item.querySelector('[data-test-experience-company]') ||
                            item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
      const durationElement = item.querySelector('[data-test-experience-duration]') ||
                             item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]');

      if (titleElement) {
        experiences.push({
          title: titleElement.textContent?.trim() || '',
          company: companyElement?.textContent?.trim() || '',
          duration: durationElement?.textContent?.trim() || ''
        });
      }
    });

    return experiences;
  }

  private extractEducation(): any[] {
    const education: any[] = [];
    const educationSection = document.querySelector('#education')?.parentElement;
    if (!educationSection) return education;

    const educationItems = educationSection.querySelectorAll('li.artdeco-list__item');
    educationItems.forEach(item => {
      const schoolElement = item.querySelector('[data-test-education-school]') ||
                           item.querySelector('.t-bold span[aria-hidden="true"]');
      const degreeElement = item.querySelector('[data-test-education-degree]') ||
                           item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
      const durationElement = item.querySelector('[data-test-education-duration]') ||
                             item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]');

      if (schoolElement) {
        education.push({
          school: schoolElement.textContent?.trim() || '',
          degree: degreeElement?.textContent?.trim() || '',
          duration: durationElement?.textContent?.trim() || ''
        });
      }
    });

    return education;
  }

  private extractSkills(): string[] {
    const skills: string[] = [];
    const skillsSection = document.querySelector('#skills')?.parentElement;
    if (!skillsSection) return skills;

    const skillElements = skillsSection.querySelectorAll('[data-test-skill-name]') ||
                         skillsSection.querySelectorAll('.t-bold span[aria-hidden="true"]');
    skillElements.forEach(element => {
      const skill = element.textContent?.trim();
      if (skill) {
        skills.push(skill);
      }
    });

    return skills;
  }

  private extractCertifications(): any[] {
    const certifications: any[] = [];
    const certSection = document.querySelector('#licenses_and_certifications')?.parentElement;
    if (!certSection) return certifications;

    const certItems = certSection.querySelectorAll('li.artdeco-list__item');
    certItems.forEach(item => {
      const nameElement = item.querySelector('[data-test-certification-name]') ||
                         item.querySelector('.t-bold span[aria-hidden="true"]');
      const issuerElement = item.querySelector('[data-test-certification-issuer]') ||
                           item.querySelector('.t-14.t-normal span[aria-hidden="true"]');

      if (nameElement) {
        certifications.push({
          name: nameElement.textContent?.trim() || '',
          issuer: issuerElement?.textContent?.trim() || ''
        });
      }
    });

    return certifications;
  }
}