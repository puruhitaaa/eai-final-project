const { Report, ReportEntry } = require("../models")
const geminiService = require("./gemini-service")
const { Op } = require("sequelize")
const moment = require("moment")

class ReportService {
  async logReport(word, category, context = null, severity = 1) {
    try {
      const entry = await ReportEntry.create({
        word,
        category,
        context,
        timestamp: new Date(),
        severity,
      })

      return entry
    } catch (error) {
      console.error("Error logging report:", error)
      throw error
    }
  }

  async generateReport(startDate, endDate, title = null) {
    try {
      // Convert string dates to Date objects if needed
      const start = startDate instanceof Date ? startDate : new Date(startDate)
      const end = endDate instanceof Date ? endDate : new Date(endDate)

      // Generate a default title if none provided
      const reportTitle =
        title ||
        `Profanity Report ${moment(start).format("YYYY-MM-DD")} to ${moment(
          end
        ).format("YYYY-MM-DD")}`

      // Get all entries within the date range
      const entries = await ReportEntry.findAll({
        where: {
          timestamp: {
            [Op.between]: [start, end],
          },
        },
        order: [["timestamp", "ASC"]],
      })

      // Calculate category breakdown
      const categoryBreakdown = {}
      entries.forEach((entry) => {
        const category = entry.category || "uncategorized"
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = 0
        }
        categoryBreakdown[category]++
      })

      // Use Gemini AI to generate a summary
      const aiResult = await geminiService.generateReportSummary(
        entries,
        start,
        end
      )

      // Create the report
      const report = await Report.create({
        title: reportTitle,
        startDate: start,
        endDate: end,
        summary: aiResult.summary || "No summary available",
        totalFlagged: entries.length,
        categoryBreakdown,
        aiGenerated: !!aiResult.summary,
        createdAt: new Date(),
      })

      // Associate entries with the report
      await Promise.all(
        entries.map((entry) => entry.update({ reportId: report.id }))
      )

      return {
        ...report.toJSON(),
        entries,
        insights: aiResult.insights || [],
        riskAssessment: aiResult.riskAssessment || "Unknown",
      }
    } catch (error) {
      console.error("Error generating report:", error)
      throw error
    }
  }

  async getReports(limit = 10, offset = 0) {
    return await Report.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    })
  }

  async getReportById(id) {
    const report = await Report.findByPk(id, {
      include: [ReportEntry],
    })

    if (!report) {
      throw new Error(`Report with ID ${id} not found`)
    }

    return report
  }

  async getReportEntries(
    reportId = null,
    startDate = null,
    endDate = null,
    limit = 100,
    offset = 0
  ) {
    const where = {}

    if (reportId) {
      where.reportId = reportId
    }

    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      where.timestamp = {
        [Op.gte]: new Date(startDate),
      }
    } else if (endDate) {
      where.timestamp = {
        [Op.lte]: new Date(endDate),
      }
    }

    return await ReportEntry.findAll({
      where,
      limit,
      offset,
      order: [["timestamp", "DESC"]],
    })
  }
}

module.exports = new ReportService()
