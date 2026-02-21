package com.smart_ecomernce_api.smart_ecomernce_api.common.performance;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

/**
 * Performance Report Generator
 *
 * Generates comprehensive performance reports comparing pre and post optimization metrics.
 * Creates both console output and file-based reports.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PerformanceReportGenerator {

    private final CachePerformanceMonitor cacheMonitor;
    private final DatabaseQueryAnalyzer queryAnalyzer;

    /**
     * Generate a comprehensive performance report
     */
    public PerformanceReport generateReport() {
        log.info("Generating comprehensive performance report...");

        PerformanceReport report = new PerformanceReport();
        report.setGeneratedAt(LocalDateTime.now());

        // Cache performance
        report.setCacheStats(cacheMonitor.generateReport());

        // Query performance
        List<DatabaseQueryAnalyzer.SlowQuery> slowQueries = queryAnalyzer.findSlowQueries(20);
        report.setSlowQueries(slowQueries);

        // Table statistics
        report.setTableStats(queryAnalyzer.getTableStatistics());

        return report;
    }

    /**
     * Generate and save report to file
     */
    public void saveReportToFile(String filename) {
        PerformanceReport report = generateReport();

        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            writer.println("=".repeat(80));
            writer.println("           SMART E-COMMERCE SYSTEM - PERFORMANCE REPORT");
            writer.println("=".repeat(80));
            writer.println();
            writer.println("Generated: " + report.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            writer.println();

            // Cache Performance Section
            writer.println("-".repeat(80));
            writer.println("1. CACHE PERFORMANCE");
            writer.println("-".repeat(80));

            CachePerformanceMonitor.CachePerformanceReport cacheReport = report.getCacheStats();
            writer.printf("Overall Hit Ratio: %.2f%%%n", cacheReport.getOverallHitRatio() * 100);
            writer.println();

            writer.println("Cache Statistics:");
            writer.printf("%-20s %10s %10s %10s %10s %10s%n",
                    "Cache Name", "Hits", "Misses", "Hit Ratio", "Evictions", "Puts");
            writer.println("-".repeat(80));

            cacheReport.getCacheStats().stream()
                    .sorted(Comparator.comparingDouble(CachePerformanceMonitor.CacheStats::getHitRatio).reversed())
                    .forEach(stats -> {
                        writer.printf("%-20s %10d %10d %9.2f%% %10d %10d%n",
                                stats.getCacheName(),
                                stats.getHits(),
                                stats.getMisses(),
                                stats.getHitRatio() * 100,
                                stats.getEvictions(),
                                stats.getPuts());
                    });

            writer.println();

            // Slow Queries Section
            writer.println("-".repeat(80));
            writer.println("2. SLOW QUERIES (Top 20 by Mean Time)");
            writer.println("-".repeat(80));

            List<DatabaseQueryAnalyzer.SlowQuery> slowQueries = report.getSlowQueries();
            if (slowQueries.isEmpty()) {
                writer.println("No slow queries found.");
            } else {
                writer.printf("%-8s %12s %12s %12s %12s %s%n",
                        "Rank", "Calls", "Total (ms)", "Mean (ms)", "Max (ms)", "Query");
                writer.println("-".repeat(80));

                int rank = 1;
                for (DatabaseQueryAnalyzer.SlowQuery query : slowQueries) {
                    String shortQuery = query.query().length() > 50
                            ? query.query().substring(0, 50) + "..."
                            : query.query();
                    writer.printf("%-8d %12d %12.2f %12.2f %12.2f %s%n",
                            rank++,
                            query.calls(),
                            query.totalTime(),
                            query.meanTime(),
                            query.maxTime(),
                            shortQuery);
                }
            }

            writer.println();

            // Table Statistics Section
            writer.println("-".repeat(80));
            writer.println("3. TABLE STATISTICS");
            writer.println("-".repeat(80));

            List<DatabaseQueryAnalyzer.TableStats> tableStats = report.getTableStats();
            writer.printf("%-30s %12s %12s %12s %12s%n",
                    "Table Name", "Row Count", "Dead Rows", "Seq Scans", "Idx Scans");
            writer.println("-".repeat(80));

            tableStats.stream()
                    .sorted(Comparator.comparingLong(DatabaseQueryAnalyzer.TableStats::rowCount).reversed())
                    .forEach(stats -> {
                        writer.printf("%-30s %12d %12d %12d %12d%n",
                                stats.tableName(),
                                stats.rowCount(),
                                stats.deadRows(),
                                stats.seqScans(),
                                stats.idxScans());
                    });

            writer.println();
            writer.println("=".repeat(80));
            writer.println("                         END OF PERFORMANCE REPORT");
            writer.println("=".repeat(80));

            log.info("Performance report saved to: {}", filename);

        } catch (IOException e) {
            log.error("Failed to save performance report: {}", e.getMessage());
        }
    }

    /**
     * Print report to console
     */
    public void printReportToConsole() {
        PerformanceReport report = generateReport();

        System.out.println("\n" + "=".repeat(80));
        System.out.println("           SMART E-COMMERCE SYSTEM - PERFORMANCE REPORT");
        System.out.println("=".repeat(80));
        System.out.println();
        System.out.println("Generated: " + report.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        System.out.println();

        // Cache Performance
        System.out.println("-".repeat(80));
        System.out.println("1. CACHE PERFORMANCE");
        System.out.println("-".repeat(80));

        CachePerformanceMonitor.CachePerformanceReport cacheReport = report.getCacheStats();
        System.out.printf("Overall Hit Ratio: %.2f%%%n%n", cacheReport.getOverallHitRatio() * 100);

        System.out.println("Cache Statistics:");
        System.out.printf("%-20s %10s %10s %10s %10s %10s%n",
                "Cache Name", "Hits", "Misses", "Hit Ratio", "Evictions", "Puts");
        System.out.println("-".repeat(80));

        cacheReport.getCacheStats().forEach(stats -> {
            System.out.printf("%-20s %10d %10d %9.2f%% %10d %10d%n",
                    stats.getCacheName(),
                    stats.getHits(),
                    stats.getMisses(),
                    stats.getHitRatio() * 100,
                    stats.getEvictions(),
                    stats.getPuts());
        });

        System.out.println();
        System.out.println("=".repeat(80));
    }

    /**
     * Performance report data class
     */
    public static class PerformanceReport {
        private LocalDateTime generatedAt;
        private CachePerformanceMonitor.CachePerformanceReport cacheStats;
        private List<DatabaseQueryAnalyzer.SlowQuery> slowQueries;
        private List<DatabaseQueryAnalyzer.TableStats> tableStats;

        public LocalDateTime getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

        public CachePerformanceMonitor.CachePerformanceReport getCacheStats() { return cacheStats; }
        public void setCacheStats(CachePerformanceMonitor.CachePerformanceReport cacheStats) { this.cacheStats = cacheStats; }

        public List<DatabaseQueryAnalyzer.SlowQuery> getSlowQueries() { return slowQueries; }
        public void setSlowQueries(List<DatabaseQueryAnalyzer.SlowQuery> slowQueries) { this.slowQueries = slowQueries; }

        public List<DatabaseQueryAnalyzer.TableStats> getTableStats() { return tableStats; }
        public void setTableStats(List<DatabaseQueryAnalyzer.TableStats> tableStats) { this.tableStats = tableStats; }
    }
}
