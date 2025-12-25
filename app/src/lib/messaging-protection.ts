// Messaging protection and safety features
export interface MessageSafetyCheck {
  isSafe: boolean
  warnings: string[]
  blocked: boolean
  reason?: string
}

export class MessagingProtection {
  // Suspicious link patterns
  private static suspiciousPatterns = [
    /bit\.ly/i,
    /tinyurl\.com/i,
    /t\.co/i,
    /goo\.gl/i,
    /short\.link/i,
    /paypal\.me/i,
    /venmo\.com/i,
    /cash\.app/i,
    /westernunion/i,
    /moneygram/i,
  ]

  // Payment request keywords
  private static paymentKeywords = [
    "send money",
    "wire transfer",
    "upfront payment",
    "processing fee",
    "verification fee",
    "deposit required",
    "pay to start",
    "send payment",
    "bank account",
    "credit card number",
  ]

  static checkMessage(content: string): MessageSafetyCheck {
    const warnings: string[] = []
    let blocked = false
    let reason: string | undefined

    // Check for suspicious links
    const links = content.match(/https?:\/\/[^\s]+/g) || []
    const suspiciousLinks = links.filter((link) =>
      this.suspiciousPatterns.some((pattern) => pattern.test(link))
    )

    if (suspiciousLinks.length > 0) {
      warnings.push(`Suspicious link detected: ${suspiciousLinks[0]}`)
      blocked = true
      reason = "Suspicious link detected"
    }

    // Check for payment requests
    const lowerContent = content.toLowerCase()
    const paymentMatches = this.paymentKeywords.filter((keyword) => lowerContent.includes(keyword))

    if (paymentMatches.length > 0) {
      warnings.push(
        "⚠️ WARNING: This message may contain a payment request. Never send money or provide payment information to employers through the platform."
      )
      if (paymentMatches.length >= 2) {
        blocked = true
        reason = "Multiple payment request indicators detected"
      }
    }

    // Check for off-platform contact requests
    if (
      /contact.*outside|email.*directly|call.*directly|text.*directly|whatsapp|telegram|signal/i.test(
        content
      )
    ) {
      warnings.push(
        "⚠️ This message requests contact outside the platform. Be cautious and report if suspicious."
      )
    }

    return {
      isSafe: !blocked && warnings.length === 0,
      warnings,
      blocked,
      reason,
    }
  }

  static sanitizeMessage(content: string): string {
    // Remove potentially dangerous content
    let sanitized = content

    // Remove suspicious links
    this.suspiciousPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(new RegExp(`https?://[^\\s]*${pattern.source}[^\\s]*`, "gi"), "[Link removed]")
    })

    return sanitized
  }

  static getSafetyTips(): string[] {
    return [
      "Never send money or provide payment information to employers",
      "Be cautious of links that don't match the company's official website",
      "Report any requests to move communication off-platform",
      "Verify employer identity through their verified badge",
      "If something seems too good to be true, it probably is",
    ]
  }
}



