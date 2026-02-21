package com.smart_ecomernce_api.smart_ecomernce_api.common.performance;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Database Query Analyzer
 *
 * Analyzes query execution plans and provides optimization recommendations.
 * Uses PostgreSQL EXPLAIN ANALYZE for detailed query analysis.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseQueryAnalyzer {

    private final DataSource dataSource;

    /**
     * Analyze a query execution plan
     */
    public QueryAnalysis analyzeQuery(String sql) {
        String explainSql = "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + sql;

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(explainSql);
             ResultSet rs = stmt.executeQuery()) {

            StringBuilder jsonResult = new StringBuilder();
            while (rs.next()) {
                jsonResult.append(rs.getString(1));
            }

            return parseExplainResult(sql, jsonResult.toString());

        } catch (SQLException e) {
            log.error("Failed to analyze query: {}", e.getMessage());
            return new QueryAnalysis(sql, false, e.getMessage(), 0, null);
        }
    }

    /**
     * Analyze slow queries from pg_stat_statements
     */
    public List<SlowQuery> findSlowQueries(int limit) {
        List<SlowQuery> slowQueries = new ArrayList<>();

        String sql = """
            SELECT 
                query,
                calls,
                total_time,
                mean_time,
                max_time,
                rows
            FROM pg_stat_statements
            WHERE query NOT LIKE '%pg_stat_statements%'
            ORDER BY mean_time DESC
            LIMIT ?
            """;

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, limit);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    slowQueries.add(new SlowQuery(
                            rs.getString("query"),
                            rs.getLong("calls"),
                            rs.getDouble("total_time"),
                            rs.getDouble("mean_time"),
                            rs.getDouble("max_time"),
                            rs.getLong("rows")
                    ));
                }
            }

        } catch (SQLException e) {
            log.error("Failed to fetch slow queries: {}", e.getMessage());
        }

        return slowQueries;
    }

    /**
     * Check for missing indexes
     */
    public List<MissingIndex> findMissingIndexes() {
        List<MissingIndex> missingIndexes = new ArrayList<>();

        String sql = """
            SELECT 
                schemaname,
                tablename,
                attname as column_name,
                n_tup_read,
                n_tup_fetch
            FROM pg_stats
            WHERE schemaname = 'public'
            AND tablename IN (
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
            )
            ORDER BY n_tup_read DESC
            LIMIT 50
            """;

        // This is a simplified version - real implementation would be more complex
        // and analyze seq_scan vs idx_scan ratios

        return missingIndexes;
    }

    /**
     * Get table statistics
     */
    public List<TableStats> getTableStatistics() {
        List<TableStats> stats = new ArrayList<>();

        String sql = """
            SELECT 
                schemaname,
                relname as table_name,
                n_live_tup as row_count,
                n_dead_tup as dead_rows,
                last_vacuum,
                last_autovacuum,
                last_analyze,
                seq_scan,
                seq_tup_read,
                idx_scan,
                idx_tup_fetch
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
            ORDER BY n_live_tup DESC
            """;

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                stats.add(new TableStats(
                        rs.getString("schemaname"),
                        rs.getString("table_name"),
                        rs.getLong("row_count"),
                        rs.getLong("dead_rows"),
                        rs.getLong("seq_scan"),
                        rs.getLong("idx_scan")
                ));
            }

        } catch (SQLException e) {
            log.error("Failed to get table statistics: {}", e.getMessage());
        }

        return stats;
    }

    /**
     * Parse EXPLAIN result
     */
    private QueryAnalysis parseExplainResult(String sql, String json) {
        // Simplified parsing - in real implementation would parse JSON
        // and extract actual execution time, planning time, etc.

        return new QueryAnalysis(
                sql,
                true,
                null,
                estimateExecutionTime(json),
                extractRecommendations(json)
        );
    }

    /**
     * Estimate execution time from explain result
     */
    private long estimateExecutionTime(String json) {
        // Simplified estimation
        return 0;
    }

    /**
     * Extract optimization recommendations
     */
    private List<String> extractRecommendations(String json) {
        List<String> recommendations = new ArrayList<>();

        // Check for sequential scans
        if (json.contains("Seq Scan")) {
            recommendations.add("Query uses sequential scan - consider adding indexes");
        }

        // Check for high cost
        if (json.contains("\"Total Cost\":")) {
            recommendations.add("Review query cost - consider query optimization");
        }

        return recommendations;
    }

    /**
     * Query analysis result
     */
    public record QueryAnalysis(
            String query,
            boolean success,
            String errorMessage,
            long estimatedTime,
            List<String> recommendations
    ) {}

    /**
     * Slow query record
     */
    public record SlowQuery(
            String query,
            long calls,
            double totalTime,
            double meanTime,
            double maxTime,
            long rows
    ) {}

    /**
     * Missing index suggestion
     */
    public record MissingIndex(
            String schema,
            String table,
            String column,
            long reads
    ) {}

    /**
     * Table statistics
     */
    public record TableStats(
            String schema,
            String tableName,
            long rowCount,
            long deadRows,
            long seqScans,
            long idxScans
    ) {}
}
