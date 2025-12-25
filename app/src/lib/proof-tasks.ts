// Proof Tasks - Short, relevant assessments tied to job types
import type { ProofCard } from "./types-extended"

export type ProofTaskType = "frontend" | "product_design" | "customer_support" | "backend" | "product_manager" | "data_analyst"

export interface ProofTask {
  id: string
  type: ProofTaskType
  title: string
  description: string
  estimatedTime: number // minutes
  questions: ProofTaskQuestion[]
  passingScore: number
}

export interface ProofTaskQuestion {
  id: string
  type: "multiple_choice" | "code" | "design" | "scenario"
  question: string
  options?: string[]
  correctAnswer?: string | number
  codeTemplate?: string
  designPrompt?: string
}

export interface ProofTaskResult {
  id: string
  taskId: string
  taskType: ProofTaskType
  candidateId: string
  score: number
  maxScore: number
  passed: boolean
  completedAt: string
  answers: Record<string, any>
  proofCard: ProofCard
}

export interface ProofTaskCard {
  id: string
  type: "proof_task"
  title: string
  description: string
  score: number
  passed: boolean
  taskType: ProofTaskType
  completedAt: string
  shareable: boolean
  verified?: boolean
  createdAt?: string
}

export class ProofTasks {
  private static taskTemplates: Record<ProofTaskType, ProofTask> = {
    frontend: {
      id: "frontend_template",
      type: "frontend",
      title: "Frontend Development Proof",
      description: "Quick assessment of frontend development skills",
      estimatedTime: 15,
      passingScore: 70,
      questions: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "What is the primary purpose of React hooks?",
          options: [
            "To manage component state and side effects",
            "To style components",
            "To handle routing",
            "To optimize performance",
          ],
          correctAnswer: 0,
        },
        {
          id: "q2",
          type: "code",
          question: "Write a function that filters an array of numbers to return only even numbers",
          codeTemplate: "function filterEven(numbers) {\n  // Your code here\n}",
        },
      ],
    },
    product_design: {
      id: "design_template",
      type: "product_design",
      title: "Product Design Proof",
      description: "Assess design thinking and UX skills",
      estimatedTime: 20,
      passingScore: 70,
      questions: [
        {
          id: "q1",
          type: "scenario",
          question:
            "A user complains that a checkout button is hard to find. What's the first step you'd take?",
          options: [
            "Move the button to a more prominent location",
            "Conduct user research to understand the problem",
            "A/B test different button colors",
            "Add more visual hierarchy",
          ],
          correctAnswer: 1,
        },
        {
          id: "q2",
          type: "design",
          question: "Design a mobile-friendly navigation for an e-commerce app",
          designPrompt: "Consider accessibility, thumb zones, and common patterns",
        },
      ],
    },
    customer_support: {
      id: "support_template",
      type: "customer_support",
      title: "Customer Support Proof",
      description: "Test communication and problem-solving skills",
      estimatedTime: 10,
      passingScore: 75,
      questions: [
        {
          id: "q1",
          type: "scenario",
          question:
            "A customer is frustrated because their order is delayed. How do you respond?",
          options: [
            "Apologize and offer a discount",
            "Acknowledge their frustration, explain the delay, and provide a solution",
            "Transfer them to a manager",
            "Ask them to wait",
          ],
          correctAnswer: 1,
        },
      ],
    },
    backend: {
      id: "backend_template",
      type: "backend",
      title: "Backend Development Proof",
      description: "Quick backend skills assessment",
      estimatedTime: 15,
      passingScore: 70,
      questions: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "What's the difference between REST and GraphQL?",
          options: [
            "REST uses HTTP, GraphQL doesn't",
            "GraphQL allows clients to request specific data, REST returns fixed endpoints",
            "REST is faster than GraphQL",
            "GraphQL is only for frontend",
          ],
          correctAnswer: 1,
        },
      ],
    },
    product_manager: {
      id: "pm_template",
      type: "product_manager",
      title: "Product Management Proof",
      description: "Assess product thinking and prioritization",
      estimatedTime: 15,
      passingScore: 70,
      questions: [
        {
          id: "q1",
          type: "scenario",
          question:
            "You have 3 features to build but only resources for 1. How do you decide?",
          options: [
            "Build the easiest one",
            "Build the one the CEO wants",
            "Analyze user impact, business value, and effort",
            "Build all three slowly",
          ],
          correctAnswer: 2,
        },
      ],
    },
    data_analyst: {
      id: "analyst_template",
      type: "data_analyst",
      title: "Data Analysis Proof",
      description: "Test data analysis and SQL skills",
      estimatedTime: 15,
      passingScore: 70,
      questions: [
        {
          id: "q1",
          type: "code",
          question: "Write a SQL query to find the top 10 customers by total order value",
          codeTemplate: "SELECT ... FROM orders ...",
        },
      ],
    },
  }

  static getTaskTemplate(type: ProofTaskType): ProofTask {
    return this.taskTemplates[type]
  }

  static getAvailableTasks(): ProofTask[] {
    return Object.values(this.taskTemplates)
  }

  static calculateScore(answers: Record<string, any>, task: ProofTask): {
    score: number
    maxScore: number
    passed: boolean
  } {
    let score = 0
    const maxScore = task.questions.length * 10 // 10 points per question

    task.questions.forEach((question) => {
      const answer = answers[question.id]
      if (question.type === "multiple_choice" && answer === question.correctAnswer) {
        score += 10
      } else if (question.type === "code" && answer) {
        // Simple check - in production, would use code evaluation
        score += 5 // Partial credit for attempting
      } else if (question.type === "scenario" && answer === question.correctAnswer) {
        score += 10
      } else if (question.type === "design" && answer) {
        score += 5 // Partial credit for attempting
      }
    })

    return {
      score,
      maxScore,
      passed: score >= (maxScore * task.passingScore) / 100,
    }
  }

  static generateProofCard(result: ProofTaskResult): ProofCard {
    return {
      id: `card_${result.id}`,
      type: "proof_task",
      title: result.proofCard.title,
      description: result.proofCard.description,
      verified: result.proofCard.verified,
      createdAt: result.proofCard.createdAt,
      score: result.score,
      passed: result.passed,
      taskType: result.taskType,
      completedAt: result.completedAt,
      shareable: true,
    }
  }

  static canReuseResult(candidateId: string, taskType: ProofTaskType, maxAgeDays: number = 90): boolean {
    // In production, check if candidate has a recent result for this task type
    // For now, return false to always require new assessment
    return false
  }
}

