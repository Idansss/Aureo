// Skill extraction from job descriptions
// Basic keyword-based extraction (no LLM required)

const SKILL_KEYWORDS: Record<string, string[]> = {
  // Frontend
  React: ["react", "reactjs", "react.js"],
  "Next.js": ["next.js", "nextjs", "next"],
  Vue: ["vue", "vuejs", "vue.js"],
  Angular: ["angular", "angularjs"],
  TypeScript: ["typescript", "ts"],
  JavaScript: ["javascript", "js", "ecmascript"],
  HTML: ["html", "html5"],
  CSS: ["css", "css3", "scss", "sass", "less"],
  Tailwind: ["tailwind", "tailwindcss"],
  "Styled Components": ["styled-components", "styled components"],
  
  // Backend
  Node: ["node", "nodejs", "node.js"],
  Python: ["python", "py"],
  Java: ["java"],
  Go: ["go", "golang"],
  Rust: ["rust"],
  PHP: ["php"],
  Ruby: ["ruby", "rails", "ruby on rails"],
  ".NET": [".net", "dotnet", "c#"],
  
  // Databases
  SQL: ["sql", "postgresql", "postgres", "mysql", "mariadb", "sqlite"],
  MongoDB: ["mongodb", "mongo"],
  Redis: ["redis"],
  PostgreSQL: ["postgresql", "postgres"],
  MySQL: ["mysql"],
  
  // Cloud & DevOps
  AWS: ["aws", "amazon web services"],
  Docker: ["docker"],
  Kubernetes: ["kubernetes", "k8s"],
  CI: ["ci/cd", "ci", "continuous integration", "jenkins", "github actions", "gitlab ci"],
  Terraform: ["terraform"],
  
  // Design
  Figma: ["figma"],
  Sketch: ["sketch"],
  "Adobe XD": ["adobe xd", "xd"],
  Photoshop: ["photoshop", "ps"],
  Illustrator: ["illustrator", "ai"],
  
  // UX/UI
  UX: ["ux", "user experience", "user research"],
  UI: ["ui", "user interface", "interface design"],
  "Design Systems": ["design system", "design systems", "component library"],
  Prototyping: ["prototyping", "prototype", "prototypes"],
  "Wireframing": ["wireframing", "wireframes", "wireframe"],
  
  // Testing
  Jest: ["jest"],
  Cypress: ["cypress"],
  "Unit Testing": ["unit test", "unit testing", "unit tests"],
  "E2E Testing": ["e2e", "end to end", "end-to-end"],
  
  // Mobile
  "React Native": ["react native", "react-native"],
  Flutter: ["flutter"],
  iOS: ["ios", "swift", "objective-c"],
  Android: ["android", "kotlin", "java"],
  
  // Other
  Git: ["git", "github", "gitlab", "bitbucket"],
  REST: ["rest", "restful", "rest api"],
  GraphQL: ["graphql"],
  Microservices: ["microservices", "microservice"],
  Agile: ["agile", "scrum", "kanban"],
  "Project Management": ["project management", "jira", "trello", "asana"],
}

export function extractSkills(text: string): string[] {
  if (!text) {
    return []
  }

  const normalized = text.toLowerCase()
  const foundSkills: Set<string> = new Set()

  // Check each skill keyword
  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        foundSkills.add(skill)
        break // Found this skill, move to next
      }
    }
  }

  return Array.from(foundSkills).sort()
}

export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase()
}

export function getSkillCategory(skill: string): string {
  const normalized = normalizeSkill(skill)
  
  if (["react", "next.js", "vue", "angular", "typescript", "javascript", "html", "css"].some(s => normalized.includes(s))) {
    return "Frontend"
  }
  if (["node", "python", "java", "go", "rust", "php", "ruby", ".net"].some(s => normalized.includes(s))) {
    return "Backend"
  }
  if (["sql", "mongodb", "redis", "postgresql", "mysql"].some(s => normalized.includes(s))) {
    return "Database"
  }
  if (["aws", "docker", "kubernetes", "ci", "terraform"].some(s => normalized.includes(s))) {
    return "DevOps"
  }
  if (["figma", "sketch", "adobe", "photoshop", "illustrator"].some(s => normalized.includes(s))) {
    return "Design Tools"
  }
  if (["ux", "ui", "design system", "prototyping", "wireframing"].some(s => normalized.includes(s))) {
    return "Design"
  }
  
  return "Other"
}

