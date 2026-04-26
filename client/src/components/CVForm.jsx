import { Plus, Trash2 } from 'lucide-react';

import {
  Button,
  Input,
  SectionToggle,
  TagInput,
  fieldClassName,
  panelClassName,
  textareaClassName,
} from './ui';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function EmptyState({ label }) {
  return (
    <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
      {label}
    </div>
  );
}

export function CVForm({ data, onChange }) {
  function updateRoot(field, value) {
    onChange({
      ...data,
      [field]: value,
    });
  }

  function updatePersonal(field, value) {
    updateRoot('personal', {
      ...data.personal,
      [field]: value,
    });
  }

  function updateList(field, nextItems) {
    updateRoot(field, nextItems);
  }

  function addExperience() {
    updateList('experience', [
      ...data.experience,
      {
        id: createId('experience'),
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
      },
    ]);
  }

  function updateExperience(id, field, value) {
    updateList(
      'experience',
      data.experience.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeExperience(id) {
    updateList(
      'experience',
      data.experience.filter((item) => item.id !== id)
    );
  }

  function addEducation() {
    updateList('education', [
      ...data.education,
      {
        id: createId('education'),
        degree: '',
        fieldOfStudy: '',
        institution: '',
        startYear: '',
        endYear: '',
        gpa: '',
      },
    ]);
  }

  function updateEducation(id, field, value) {
    updateList(
      'education',
      data.education.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeEducation(id) {
    updateList(
      'education',
      data.education.filter((item) => item.id !== id)
    );
  }

  function addCertification() {
    updateList('certifications', [
      ...data.certifications,
      {
        id: createId('certification'),
        name: '',
        issuer: '',
        year: '',
      },
    ]);
  }

  function updateCertification(id, field, value) {
    updateList(
      'certifications',
      data.certifications.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeCertification(id) {
    updateList(
      'certifications',
      data.certifications.filter((item) => item.id !== id)
    );
  }

  function addLanguage() {
    updateList('languages', [
      ...data.languages,
      {
        id: createId('language'),
        language: '',
        proficiency: 'Conversational',
      },
    ]);
  }

  function updateLanguage(id, field, value) {
    updateList(
      'languages',
      data.languages.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeLanguage(id) {
    updateList(
      'languages',
      data.languages.filter((item) => item.id !== id)
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-full mb-2">
        <SectionToggle
          order={data.sectionOrder}
          onChange={(order) => updateRoot('sectionOrder', order)}
        />
      </div>

      <div className={panelClassName}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 transition-colors">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={data.personal.fullName}
            onChange={(event) => updatePersonal('fullName', event.target.value)}
            placeholder="Jane Doe"
          />
          <Input
            label="Job Title"
            value={data.personal.jobTitle}
            onChange={(event) => updatePersonal('jobTitle', event.target.value)}
            placeholder="Software Engineer"
          />
          <Input
            label="Email"
            type="email"
            value={data.personal.email}
            onChange={(event) => updatePersonal('email', event.target.value)}
            placeholder="jane@example.com"
          />
          <Input
            label="Phone"
            value={data.personal.phone}
            onChange={(event) => updatePersonal('phone', event.target.value)}
            placeholder="+1 (555) 000-0000"
          />
          <Input
            label="Location"
            value={data.personal.location}
            onChange={(event) => updatePersonal('location', event.target.value)}
            placeholder="San Francisco, CA"
          />
          <Input
            label="LinkedIn URL"
            value={data.personal.linkedin}
            onChange={(event) => updatePersonal('linkedin', event.target.value)}
            placeholder="linkedin.com/in/janedoe"
          />
          <Input
            label="GitHub URL (Optional)"
            value={data.personal.github}
            onChange={(event) => updatePersonal('github', event.target.value)}
            placeholder="github.com/janedoe"
          />
          <Input
            label="Website URL (Optional)"
            value={data.personal.website}
            onChange={(event) => updatePersonal('website', event.target.value)}
            placeholder="janedoe.com"
          />
        </div>
      </div>

      <div className={panelClassName}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 transition-colors">
          Professional Summary
        </h2>
        <div className="relative">
          <textarea
            className={`${textareaClassName} h-32 resize-none`}
            placeholder="Briefly describe your professional background and key achievements..."
            value={data.summary}
            onChange={(event) => updateRoot('summary', event.target.value.slice(0, 500))}
          />
          <div className="absolute bottom-2 right-2 text-xs text-slate-400">
            {data.summary.length}/500
          </div>
        </div>
      </div>

      {data.sectionOrder === 'experience' ? (
        <>
          <div className={panelClassName}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">Work Experience</h2>
              <Button variant="ghost" size="sm" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <div className="space-y-6">
              {data.experience.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors relative group"
                >
                  <button
                    onClick={() => removeExperience(item.id)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Job Title"
                      value={item.jobTitle}
                      onChange={(event) =>
                        updateExperience(item.id, 'jobTitle', event.target.value)
                      }
                      placeholder="Senior Developer"
                    />
                    <Input
                      label="Company"
                      value={item.company}
                      onChange={(event) =>
                        updateExperience(item.id, 'company', event.target.value)
                      }
                      placeholder="Tech Corp"
                    />
                    <Input
                      label="Start Date"
                      value={item.startDate}
                      onChange={(event) =>
                        updateExperience(item.id, 'startDate', event.target.value)
                      }
                      placeholder="MM/YYYY"
                    />
                    <div className="space-y-2">
                      <Input
                        label="End Date"
                        value={item.endDate}
                        onChange={(event) =>
                          updateExperience(item.id, 'endDate', event.target.value)
                        }
                        placeholder="MM/YYYY"
                        disabled={item.isCurrent}
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={Boolean(item.isCurrent)}
                          onChange={(event) =>
                            updateExperience(item.id, 'isCurrent', event.target.checked)
                          }
                          className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                        />
                        I currently work here
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                      Description
                    </label>
                    <textarea
                      className={`${textareaClassName} h-24`}
                      placeholder={'- Achieved X by doing Y\n- Led a team of Z developers'}
                      value={item.description}
                      onChange={(event) =>
                        updateExperience(item.id, 'description', event.target.value)
                      }
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                      Use bullet points for better readability.
                    </p>
                  </div>
                </div>
              ))}

              {data.experience.length === 0 && (
                <EmptyState label='No experience added yet. Click "Add" to start.' />
              )}
            </div>
          </div>

          <div className={panelClassName}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">Education</h2>
              <Button variant="ghost" size="sm" onClick={addEducation}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <div className="space-y-6">
              {data.education.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors relative group"
                >
                  <button
                    onClick={() => removeEducation(item.id)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Degree"
                      value={item.degree}
                      onChange={(event) =>
                        updateEducation(item.id, 'degree', event.target.value)
                      }
                      placeholder="Bachelor of Science"
                    />
                    <Input
                      label="Field of Study"
                      value={item.fieldOfStudy}
                      onChange={(event) =>
                        updateEducation(item.id, 'fieldOfStudy', event.target.value)
                      }
                      placeholder="Computer Science"
                    />
                    <Input
                      label="Institution"
                      value={item.institution}
                      onChange={(event) =>
                        updateEducation(item.id, 'institution', event.target.value)
                      }
                      placeholder="University of Technology"
                      className="md:col-span-2"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Start Year"
                        value={item.startYear}
                        onChange={(event) =>
                          updateEducation(item.id, 'startYear', event.target.value)
                        }
                        placeholder="2018"
                      />
                      <Input
                        label="End Year"
                        value={item.endYear}
                        onChange={(event) =>
                          updateEducation(item.id, 'endYear', event.target.value)
                        }
                        placeholder="2022"
                      />
                    </div>
                    <Input
                      label="GPA (Optional)"
                      value={item.gpa}
                      onChange={(event) => updateEducation(item.id, 'gpa', event.target.value)}
                      placeholder="3.8"
                    />
                  </div>
                </div>
              ))}

              {data.education.length === 0 && (
                <EmptyState label='No education added yet. Click "Add" to start.' />
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={panelClassName}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">Education</h2>
              <Button variant="ghost" size="sm" onClick={addEducation}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <div className="space-y-6">
              {data.education.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors relative group"
                >
                  <button
                    onClick={() => removeEducation(item.id)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Degree"
                      value={item.degree}
                      onChange={(event) =>
                        updateEducation(item.id, 'degree', event.target.value)
                      }
                      placeholder="Bachelor of Science"
                    />
                    <Input
                      label="Field of Study"
                      value={item.fieldOfStudy}
                      onChange={(event) =>
                        updateEducation(item.id, 'fieldOfStudy', event.target.value)
                      }
                      placeholder="Computer Science"
                    />
                    <Input
                      label="Institution"
                      value={item.institution}
                      onChange={(event) =>
                        updateEducation(item.id, 'institution', event.target.value)
                      }
                      placeholder="University of Technology"
                      className="md:col-span-2"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Start Year"
                        value={item.startYear}
                        onChange={(event) =>
                          updateEducation(item.id, 'startYear', event.target.value)
                        }
                        placeholder="2018"
                      />
                      <Input
                        label="End Year"
                        value={item.endYear}
                        onChange={(event) =>
                          updateEducation(item.id, 'endYear', event.target.value)
                        }
                        placeholder="2022"
                      />
                    </div>
                    <Input
                      label="GPA (Optional)"
                      value={item.gpa}
                      onChange={(event) => updateEducation(item.id, 'gpa', event.target.value)}
                      placeholder="3.8"
                    />
                  </div>
                </div>
              ))}

              {data.education.length === 0 && (
                <EmptyState label='No education added yet. Click "Add" to start.' />
              )}
            </div>
          </div>

          <div className={panelClassName}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">Work Experience</h2>
              <Button variant="ghost" size="sm" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <div className="space-y-6">
              {data.experience.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors relative group"
                >
                  <button
                    onClick={() => removeExperience(item.id)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Job Title"
                      value={item.jobTitle}
                      onChange={(event) =>
                        updateExperience(item.id, 'jobTitle', event.target.value)
                      }
                      placeholder="Senior Developer"
                    />
                    <Input
                      label="Company"
                      value={item.company}
                      onChange={(event) =>
                        updateExperience(item.id, 'company', event.target.value)
                      }
                      placeholder="Tech Corp"
                    />
                    <Input
                      label="Start Date"
                      value={item.startDate}
                      onChange={(event) =>
                        updateExperience(item.id, 'startDate', event.target.value)
                      }
                      placeholder="MM/YYYY"
                    />
                    <div className="space-y-2">
                      <Input
                        label="End Date"
                        value={item.endDate}
                        onChange={(event) =>
                          updateExperience(item.id, 'endDate', event.target.value)
                        }
                        placeholder="MM/YYYY"
                        disabled={item.isCurrent}
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={Boolean(item.isCurrent)}
                          onChange={(event) =>
                            updateExperience(item.id, 'isCurrent', event.target.checked)
                          }
                          className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                        />
                        I currently work here
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                      Description
                    </label>
                    <textarea
                      className={`${textareaClassName} h-24`}
                      placeholder={'- Achieved X by doing Y\n- Led a team of Z developers'}
                      value={item.description}
                      onChange={(event) =>
                        updateExperience(item.id, 'description', event.target.value)
                      }
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                      Use bullet points for better readability.
                    </p>
                  </div>
                </div>
              ))}

              {data.experience.length === 0 && (
                <EmptyState label='No experience added yet. Click "Add" to start.' />
              )}
            </div>
          </div>
        </>
      )}

      <div className={panelClassName}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 transition-colors">
          Skills
        </h2>
        <TagInput
          label="Add Skills"
          tags={data.skills}
          onChange={(skills) => updateRoot('skills', skills)}
          placeholder="e.g. React, Node.js, MongoDB"
        />
      </div>

      <div className={panelClassName}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 transition-colors">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">Certifications</h2>
          <Button variant="ghost" size="sm" onClick={addCertification}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-4">
          {data.certifications.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors relative group"
            >
              <button
                onClick={() => removeCertification(item.id)}
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Certification Name"
                  value={item.name}
                  onChange={(event) =>
                    updateCertification(item.id, 'name', event.target.value)
                  }
                  placeholder="AWS Certified Solutions Architect"
                />
                <Input
                  label="Issuing Organization"
                  value={item.issuer}
                  onChange={(event) =>
                    updateCertification(item.id, 'issuer', event.target.value)
                  }
                  placeholder="Amazon Web Services"
                />
                <Input
                  label="Year"
                  value={item.year}
                  onChange={(event) =>
                    updateCertification(item.id, 'year', event.target.value)
                  }
                  placeholder="2023"
                />
              </div>
            </div>
          ))}

          {data.certifications.length === 0 && (
            <EmptyState label='No certifications added yet. Click "Add" to start.' />
          )}
        </div>
      </div>

      <div className={panelClassName}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 transition-colors">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">Languages</h2>
          <Button variant="ghost" size="sm" onClick={addLanguage}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-4">
          {data.languages.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors relative group"
            >
              <button
                onClick={() => removeLanguage(item.id)}
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Language"
                  value={item.language}
                  onChange={(event) => updateLanguage(item.id, 'language', event.target.value)}
                  placeholder="Spanish"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">
                    Proficiency
                  </label>
                  <select
                    className={fieldClassName}
                    value={item.proficiency}
                    onChange={(event) =>
                      updateLanguage(item.id, 'proficiency', event.target.value)
                    }
                  >
                    <option value="Basic">Basic</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Native">Native</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {data.languages.length === 0 && (
            <EmptyState label='No languages added yet. Click "Add" to start.' />
          )}
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  );
}
