export const skills = [
  'TypeScript',
  'React',
  'Ruby on Rails',
  'Node.js',
  'AWS',
  'System Design',
  'Mentoring',
] as const

export type Skill = (typeof skills)[number]
