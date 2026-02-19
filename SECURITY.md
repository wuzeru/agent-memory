# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Status

✅ **All runtime dependencies are secure** - No known vulnerabilities

### XLSX Support - REMOVED

**Previous Issue**: The `xlsx` package had known security vulnerabilities with no available patches.

**Resolution**: ✅ **XLSX support has been completely removed** from AgentMemory to ensure security.

#### Why XLSX Was Removed

The xlsx package (v0.18.5) had two critical vulnerabilities:
1. **Regular Expression Denial of Service (ReDoS)** - affects versions < 0.20.2
2. **Prototype Pollution** - affects versions < 0.19.3

Since no patched version exists (latest npm version is 0.18.5), we removed the package entirely.

## Alternatives to XLSX

If you need to work with Excel files, use one of these **safe alternatives**:

### Option 1: CSV Format (Recommended)
Convert your Excel files to CSV before ingesting:

**Using Excel/LibreOffice**:
1. Open the .xlsx file
2. File → Save As → CSV
3. Ingest the CSV file with AgentMemory

**Command line** (requires LibreOffice):
```bash
soffice --headless --convert-to csv yourfile.xlsx
agent-memory ingest yourfile.csv
```

### Option 2: Google Sheets
- Upload Excel to Google Sheets
- Export as CSV
- Ingest the CSV

### Option 3: Online Converters
Use trusted online tools to convert XLSX → CSV:
- CloudConvert
- Zamzar
- ConvertIO

### Option 4: Manual Installation (Not Recommended)
If you absolutely need XLSX support and understand the risks:

```bash
# Install xlsx at your own risk
npm install xlsx

# Extend ConvertService to add XLSX support
# (requires code modifications)
```

⚠️ **Warning**: This reintroduces the security vulnerabilities. Only do this if:
- You fully trust all XLSX file sources
- Files are from internal/controlled sources only
- You implement additional security measures
- You accept the security risks

## Current Supported Formats

✅ **Safely Supported Formats**:
- Text: .txt, .md
- Documents: .pdf, .docx
- Data: .csv, .json, .yaml, .yml
- Code: .js, .ts, .py, .java, .cpp, .c, .go, .rs
- Web: .html, .css, .xml

All supported formats use packages with no known security vulnerabilities.

## Reporting a Vulnerability

If you discover a security vulnerability in AgentMemory (excluding the known xlsx issues), please report it by:

1. **Do NOT** open a public issue
2. Create a private security advisory on GitHub
3. Or email the maintainers directly

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We will respond within 48 hours and work on a fix as soon as possible.

## Security Best Practices

When using AgentMemory:

### 1. Input Validation
```typescript
// Always validate file paths
if (!isValidPath(filePath)) {
  throw new Error('Invalid file path');
}

// Check file extensions
const allowed = ['.txt', '.md', '.pdf', '.csv'];
if (!allowed.includes(path.extname(filePath))) {
  throw new Error('File type not allowed');
}
```

### 2. File Size Limits
```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const stats = fs.statSync(filePath);
if (stats.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

### 3. Sandboxing
- Run AgentMemory in containerized environments (Docker)
- Use separate user accounts with limited permissions
- Implement resource limits (CPU, memory, disk)

### 4. Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Update dependencies (excluding xlsx)
npm update

# Review security advisories
npm audit report
```

### 5. Monitoring
- Log all file ingestion operations
- Monitor for unusual patterns
- Set up alerts for errors

## Security Checklist

Before deploying AgentMemory:

- [ ] Review and understand xlsx vulnerabilities
- [ ] Decide if XLSX support is needed
- [ ] Implement input validation
- [ ] Set file size limits
- [ ] Configure sandboxed environment
- [ ] Set up monitoring and logging
- [ ] Test error handling
- [ ] Document security procedures for your team

## Updates

This security policy will be updated as:
- New vulnerabilities are discovered
- Patches become available
- Security best practices evolve

Last updated: 2026-02-19

---

**Note**: The xlsx vulnerabilities are known and documented. By using this software, you acknowledge these risks and agree to follow the security recommendations provided.
