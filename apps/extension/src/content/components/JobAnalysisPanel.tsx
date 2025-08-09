import React, { useState } from 'react';
import { LinkedInJobData, MatchScore } from '../../utils/types';
import { X, Save, TrendingUp, MapPin, Briefcase, GraduationCap } from 'lucide-react';

interface JobAnalysisPanelProps {
  jobData: LinkedInJobData & { match_score?: MatchScore };
  onSave: () => void;
  onClose: () => void;
}

export const JobAnalysisPanel: React.FC<JobAnalysisPanelProps> = ({
  jobData,
  onSave,
  onClose
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSave = () => {
    onSave();
    setIsSaved(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="lja-panel-container">
      <div className="lja-panel-header">
        <h3 className="lja-panel-title">Job Analysis</h3>
        <div className="lja-panel-actions">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lja-btn-icon"
            aria-label={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? '−' : '+'}
          </button>
          <button
            onClick={onClose}
            className="lja-btn-icon"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {jobData.match_score && (
            <div className="lja-match-score">
              <div className="lja-overall-score">
                <div className={`lja-score-circle ${getScoreBackground(jobData.match_score.overall)}`}>
                  <span className={`lja-score-text ${getScoreColor(jobData.match_score.overall)}`}>
                    {jobData.match_score.overall}%
                  </span>
                </div>
                <div className="lja-score-label">Overall Match</div>
              </div>

              <div className="lja-score-breakdown">
                <div className="lja-score-item">
                  <TrendingUp size={16} className="lja-score-icon" />
                  <div className="lja-score-details">
                    <span className="lja-score-category">Skills</span>
                    <span className={`lja-score-value ${getScoreColor(jobData.match_score.skills)}`}>
                      {jobData.match_score.skills}%
                    </span>
                  </div>
                </div>

                <div className="lja-score-item">
                  <Briefcase size={16} className="lja-score-icon" />
                  <div className="lja-score-details">
                    <span className="lja-score-category">Experience</span>
                    <span className={`lja-score-value ${getScoreColor(jobData.match_score.experience)}`}>
                      {jobData.match_score.experience}%
                    </span>
                  </div>
                </div>

                <div className="lja-score-item">
                  <GraduationCap size={16} className="lja-score-icon" />
                  <div className="lja-score-details">
                    <span className="lja-score-category">Education</span>
                    <span className={`lja-score-value ${getScoreColor(jobData.match_score.education)}`}>
                      {jobData.match_score.education}%
                    </span>
                  </div>
                </div>

                <div className="lja-score-item">
                  <MapPin size={16} className="lja-score-icon" />
                  <div className="lja-score-details">
                    <span className="lja-score-category">Location</span>
                    <span className={`lja-score-value ${getScoreColor(jobData.match_score.location)}`}>
                      {jobData.match_score.location}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="lja-job-details">
            <div className="lja-detail-item">
              <strong>Type:</strong> {jobData.jobType || 'Not specified'}
            </div>
            <div className="lja-detail-item">
              <strong>Level:</strong> {jobData.experienceLevel || 'Not specified'}
            </div>
            {jobData.postedDate && (
              <div className="lja-detail-item">
                <strong>Posted:</strong> {jobData.postedDate}
              </div>
            )}
            {jobData.applicants && jobData.applicants > 0 && (
              <div className="lja-detail-item">
                <strong>Applicants:</strong> {jobData.applicants}
              </div>
            )}
            {jobData.isEasyApply && (
              <div className="lja-easy-apply-badge">Easy Apply</div>
            )}
          </div>

          <div className="lja-panel-footer">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`lja-btn-primary ${isSaved ? 'lja-btn-disabled' : ''}`}
            >
              <Save size={16} />
              <span>{isSaved ? 'Saved' : 'Save to Dashboard'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};