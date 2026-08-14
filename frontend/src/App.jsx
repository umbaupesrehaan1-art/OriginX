import { useState } from "react";

const API = "https://originx-backend-wmdz.onrender.com";
function App() {
  const [file, setFile] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [audit, setAudit] = useState(null);
  const [privacyAudit, setPrivacyAudit] = useState(null);
  const [dp, setDp] = useState(null);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // GENERIC API ERROR HANDLER
  // =========================================================

  async function getErrorMessage(response) {
    try {
      const data = await response.json();

      if (typeof data.detail === "string") {
        return data.detail;
      }

      return "Request failed.";
    } catch {
      return "Request failed.";
    }
  }

  // =========================================================
  // 01 — ANALYZE DATASET
  // =========================================================

  async function analyzeDataset() {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setError("");
    setLoading("analyze");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      setAnalysis(data);

      // Reset later-stage results when a new dataset is analyzed
      setGeneration(null);
      setAudit(null);
      setPrivacyAudit(null);
      setDp(null);
      setReport(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  // =========================================================
  // 02 — GENERATE SYNTHETIC DATA
  // =========================================================

  async function generateDataset() {
    if (!analysis) {
      setError("Analyze the dataset first.");
      return;
    }

    setError("");
    setLoading("generate");

    try {
      const filename = analysis.filename;

      const response = await fetch(
        `${API}/generate?filename=${encodeURIComponent(
          filename
        )}&epochs=10`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      setGeneration(data);

      // Clear previous results
      setAudit(null);
      setPrivacyAudit(null);
      setDp(null);
      setReport(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  // =========================================================
  // 03 — QUALITY AUDIT
  // =========================================================

  async function runAudit() {
    if (!analysis || !generation) {
      setError("Generate the synthetic dataset first.");
      return;
    }

    setError("");
    setLoading("audit");

    try {
      const originalFilename = analysis.filename;
      const syntheticFilename = `synthetic_${originalFilename}`;

      const response = await fetch(
        `${API}/audit?original_filename=${encodeURIComponent(
          originalFilename
        )}&synthetic_filename=${encodeURIComponent(
          syntheticFilename
        )}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      setAudit(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  // =========================================================
  // 04 — PRIVACY AUDIT
  // =========================================================

  async function runPrivacyAudit() {
    if (!analysis || !generation) {
      setError("Generate the synthetic dataset first.");
      return;
    }

    setError("");
    setLoading("privacy");

    try {
      const originalFilename = analysis.filename;
      const syntheticFilename = `synthetic_${originalFilename}`;

      const response = await fetch(
        `${API}/privacy-audit?original_filename=${encodeURIComponent(
          originalFilename
        )}&synthetic_filename=${encodeURIComponent(
          syntheticFilename
        )}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      setPrivacyAudit(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  // =========================================================
  // 05 — DIFFERENTIAL PRIVACY / DP-SGD
  // =========================================================

  async function runDPDemo() {
    setError("");
    setLoading("dp");

    try {
      const response = await fetch(`${API}/privacy-dp`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      setDp(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  // =========================================================
  // 06 — FINAL REPORT
  // =========================================================

  async function loadFinalReport() {
    setError("");
    setLoading("report");

    try {
      const response = await fetch(`${API}/report`);

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      setReport(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading("");
    }
  }

  // =========================================================
  // RESET PROJECT
  // =========================================================

  function resetProject() {
    setFile(null);
    setAnalysis(null);
    setGeneration(null);
    setAudit(null);
    setPrivacyAudit(null);
    setDp(null);
    setReport(null);
    setError("");
    setLoading("");
  }

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  const isLoading = loading !== "";

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              OriginX
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Privacy-Safe Synthetic Data Platform
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-900 bg-green-950/30">

            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>

            <span className="text-sm text-green-400">
              System Ready
            </span>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="mb-12">

          <div className="inline-block px-3 py-1 rounded-full border border-cyan-900 bg-cyan-950/30 text-cyan-400 text-xs font-semibold mb-5">
            SYNTHETIC DATA INTELLIGENCE
          </div>

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Generate data.
            <br />

            <span className="text-cyan-400">
              Protect privacy.
            </span>
          </h2>

          <p className="mt-5 text-slate-400 text-lg max-w-3xl leading-relaxed">
            OriginX analyzes sensitive datasets, generates synthetic
            records, evaluates statistical utility, and measures
            privacy through one unified workflow.
          </p>

        </section>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-8 p-5 rounded-2xl border border-red-900 bg-red-950/30">

            <p className="text-red-400 font-semibold">
              Error
            </p>

            <p className="text-red-300 text-sm mt-1">
              {error}
            </p>

          </div>
        )}

        {/* ===================================================
            01 — UPLOAD
        =================================================== */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-7 mb-8">

          <div className="flex justify-between items-start">

            <div>
              <h3 className="text-2xl font-semibold">
                01 — Upload Dataset
              </h3>

              <p className="text-slate-500 text-sm mt-2">
                Start by selecting your source CSV dataset.
              </p>
            </div>

            {analysis && (
              <div className="px-3 py-1 rounded-full bg-green-950 text-green-400 text-xs">
                ✓ Analyzed
              </div>
            )}

          </div>

          <div className="mt-7 flex flex-col md:flex-row gap-5 items-start md:items-center">

            <label className="cursor-pointer">

              <span className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition">
                Choose CSV File
              </span>

              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setAnalysis(null);
                  setGeneration(null);
                  setAudit(null);
                  setPrivacyAudit(null);
                  setDp(null);
                  setReport(null);
                  setError("");
                }}
              />

            </label>

            <div className="text-slate-400 text-sm">
              {file ? file.name : "No file selected"}
            </div>

            <button
              onClick={analyzeDataset}
              disabled={!file || isLoading}
              className="md:ml-auto px-7 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading === "analyze"
                ? "Analyzing..."
                : "Analyze Dataset"}
            </button>

          </div>

        </section>

        {/* ===================================================
            ANALYSIS RESULTS
        =================================================== */}

        {analysis && (
          <section className="mb-8">

            <div className="flex justify-between items-center mb-5">

              <div>
                <h3 className="text-xl font-semibold">
                  Dataset Analysis
                </h3>

                <p className="text-slate-500 text-sm mt-1">
                  Learn stage completed
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-green-950 text-green-400 text-xs">
                ✓ Analyzed
              </span>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

              <MetricCard
                title="Records"
                value={analysis.dataset.records.toLocaleString()}
              />

              <MetricCard
                title="Columns"
                value={analysis.dataset.columns}
              />

              <MetricCard
                title="Missing Values"
                value={analysis.dataset.missing_values}
              />

              <MetricCard
                title="Privacy Risk"
                value={analysis.privacy_analysis.risk_level}
              />

            </div>

            <div className="mt-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <p className="text-sm text-slate-400 mb-4">
                Sensitive Columns
              </p>

              <div className="flex flex-wrap gap-3">

                {analysis.privacy_analysis.sensitive_columns.map(
                  (column) => (
                    <span
                      key={column}
                      className="px-4 py-2 rounded-lg border border-red-800 bg-red-950/20 text-red-400 text-sm"
                    >
                      {column}
                    </span>
                  )
                )}

              </div>

            </div>

          </section>
        )}

        {/* ===================================================
            02 — GENERATE
        =================================================== */}

        {analysis && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-7 mb-8">

            <div className="flex justify-between items-start">

              <div>
                <h3 className="text-2xl font-semibold">
                  02 — Generate Synthetic Data
                </h3>

                <p className="text-slate-500 text-sm mt-2">
                  Generate new records using CTGAN.
                </p>
              </div>

              {generation && (
                <span className="px-3 py-1 rounded-full bg-green-950 text-green-400 text-xs">
                  ✓ Generated
                </span>
              )}

            </div>

            <button
              onClick={generateDataset}
              disabled={isLoading}
              className="mt-7 px-7 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-40 transition"
            >
              {loading === "generate"
                ? "Generating..."
                : "Generate Synthetic Dataset"}
            </button>

            {generation && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">

                <MetricCard
                  title="Original Records"
                  value={generation.generation.original_records.toLocaleString()}
                />

                <MetricCard
                  title="Synthetic Records"
                  value={generation.generation.synthetic_records.toLocaleString()}
                />

                <MetricCard
                  title="Method"
                  value={generation.generation.method || "CTGAN"}
                />

              </div>
            )}

          </section>
        )}

        {/* ===================================================
            03 — AUDIT
        =================================================== */}

        {generation && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-7 mb-8">

            <div className="flex justify-between items-start">

              <div>
                <h3 className="text-2xl font-semibold">
                  03 — Audit Synthetic Data
                </h3>

                <p className="text-slate-500 text-sm mt-2">
                  Measure statistical similarity using SDMetrics.
                </p>
              </div>

              {audit && (
                <span className="px-3 py-1 rounded-full bg-green-950 text-green-400 text-xs">
                  ✓ Audit Completed
                </span>
              )}

            </div>

            <button
              onClick={runAudit}
              disabled={isLoading}
              className="mt-7 px-7 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-40 transition"
            >
              {loading === "audit"
                ? "Running Quality Audit..."
                : "Run Quality Audit"}
            </button>

            {audit && (
              <div className="mt-8">

                <div className="flex justify-between mb-3">

                  <span className="text-slate-400">
                    Overall Quality
                  </span>

                  <span className="font-bold text-cyan-400">
                    {audit.audit.overall_quality_score}%
                  </span>

                </div>

                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{
                      width: `${audit.audit.overall_quality_score}%`,
                    }}
                  />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">

                  <MetricCard
                    title="Original Records"
                    value={audit.audit.original_records.toLocaleString()}
                  />

                  <MetricCard
                    title="Synthetic Records"
                    value={audit.audit.synthetic_records.toLocaleString()}
                  />

                  <MetricCard
                    title="Direct Record Matches"
                    value={audit.audit.direct_record_matches}
                  />

                </div>

                <div className="mt-6 p-5 rounded-xl border border-green-900 bg-green-950/20">

                  <p className="text-green-400 font-semibold">
                    {audit.audit.record_match_status ===
                    "NO_DIRECT_MATCH"
                      ? "✓ No direct record matches detected"
                      : "Record matches detected"}
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    The audit compares the source and synthetic
                    datasets for statistical utility and direct
                    record overlap.
                  </p>

                </div>

              </div>
            )}

          </section>
        )}

        {/* ===================================================
            04 — PRIVACY
        =================================================== */}

        {generation && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-7 mb-8">

            <div className="flex justify-between items-start">

              <div>
                <h3 className="text-2xl font-semibold">
                  04 — Privacy Analysis
                </h3>

                <p className="text-slate-500 text-sm mt-2">
                  Evaluate privacy signals and DP-SGD accounting.
                </p>
              </div>

              {privacyAudit && (
                <span className="px-3 py-1 rounded-full bg-green-950 text-green-400 text-xs">
                  ✓ Privacy Audit Completed
                </span>
              )}

            </div>

            <div className="mt-7 flex flex-wrap gap-4">

              <button
                onClick={runPrivacyAudit}
                disabled={isLoading}
                className="px-7 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-40 transition"
              >
                {loading === "privacy"
                  ? "Running Privacy Audit..."
                  : "Run Privacy Audit"}
              </button>

              <button
                onClick={runDPDemo}
                disabled={isLoading}
                className="px-7 py-3 rounded-lg border border-cyan-700 bg-cyan-950/30 text-cyan-400 font-semibold hover:bg-cyan-950/60 disabled:opacity-40 transition"
              >
                {loading === "dp"
                  ? "Running DP-SGD..."
                  : "Run DP-SGD Demo"}
              </button>

            </div>

            {/* PRIVACY AUDIT RESULT */}

            {privacyAudit && (
              <div className="mt-8">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  <MetricCard
                    title="Privacy Risk"
                    value={
                      privacyAudit.privacy_audit
                        .privacy_risk_indicator
                    }
                  />

                  <MetricCard
                    title="Exact Matches"
                    value={
                      privacyAudit.privacy_audit
                        .exact_record_matches
                    }
                  />

                  <MetricCard
                    title="Sensitive Columns"
                    value={
                      privacyAudit.privacy_audit
                        .sensitive_columns.length
                    }
                  />

                </div>

                <div className="mt-6 p-5 rounded-xl border border-green-900 bg-green-950/20">

                  <p className="text-green-400 font-semibold">
                    Privacy Risk Analysis Completed
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    {
                      privacyAudit.privacy_audit
                        .note
                    }
                  </p>

                </div>

              </div>
            )}

            {/* DP RESULTS */}

            {dp && (
              <div className="mt-8">

                <div className="mb-5">

                  <h4 className="text-xl font-semibold">
                    Differential Privacy Results
                  </h4>

                  <p className="text-slate-500 text-sm mt-1">
                    DP-SGD privacy accounting completed using
                    Opacus and PyTorch.
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  <Info
                    label="Mechanism"
                    value={dp.privacy.mechanism}
                  />

                  <Info
                    label="Framework"
                    value={dp.privacy.framework}
                  />

                  <Info
                    label="Library"
                    value={dp.privacy.library}
                  />

                  <Info
                    label="Records Used"
                    value={dp.privacy.records_used.toLocaleString()}
                  />

                  <Info
                    label="Epochs"
                    value={dp.privacy.epochs}
                  />

                  <Info
                    label="Batch Size"
                    value={dp.privacy.batch_size}
                  />

                  <Info
                    label="Noise Multiplier"
                    value={dp.privacy.noise_multiplier}
                  />

                  <Info
                    label="Epsilon (ε)"
                    value={dp.privacy.achieved_epsilon}
                  />

                  <Info
                    label="Delta (δ)"
                    value={dp.privacy.delta}
                  />

                </div>

                <div className="mt-7 p-5 rounded-xl border border-cyan-900 bg-cyan-950/20">

                  <p className="text-cyan-400 font-semibold">
                    DP-SGD Active
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    Target ε:{" "}
                    {dp.privacy.target_epsilon}
                    {" • "}
                    Achieved ε:{" "}
                    {dp.privacy.achieved_epsilon}
                    {" • "}
                    δ:{" "}
                    {dp.privacy.delta}
                  </p>

                  <p className="text-xs text-slate-600 mt-3">
                    {dp.privacy.important_note}
                  </p>

                </div>

              </div>
            )}

          </section>
        )}

        {/* ===================================================
            FINAL REPORT
        =================================================== */}

        {(audit || privacyAudit || dp) && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-7 mb-8">

            <div className="flex justify-between items-start">

              <div>
                <h3 className="text-2xl font-semibold">
                  OriginX Results
                </h3>

                <p className="text-slate-500 text-sm mt-2">
                  Final synthetic data and privacy evaluation.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs">
                Prototype v1.0
              </span>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">

              <MetricCard
                title="Source"
                value={
                  audit
                    ? audit.audit.original_records.toLocaleString()
                    : analysis?.dataset.records.toLocaleString()
                }
              />

              <MetricCard
                title="Synthetic"
                value={
                  audit
                    ? audit.audit.synthetic_records.toLocaleString()
                    : generation?.generation.synthetic_records.toLocaleString()
                }
              />

              <MetricCard
                title="Quality"
                value={
                  audit
                    ? `${audit.audit.overall_quality_score}%`
                    : "Pending"
                }
              />

              <MetricCard
                title="Privacy"
                value={
                  privacyAudit
                    ? privacyAudit.privacy_audit
                        .privacy_risk_indicator
                    : "Pending"
                }
              />

            </div>

            {dp && (
              <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-5">

                <MetricCard
                  title="DP Mechanism"
                  value={dp.privacy.mechanism}
                />

                <MetricCard
                  title="Epsilon (ε)"
                  value={dp.privacy.achieved_epsilon}
                />

                <MetricCard
                  title="Delta (δ)"
                  value={dp.privacy.delta}
                />

              </div>
            )}

            <button
              onClick={loadFinalReport}
              disabled={loading === "report"}
              className="mt-8 px-7 py-3 rounded-lg border border-slate-700 bg-slate-950 text-white font-semibold hover:border-cyan-700 disabled:opacity-40 transition"
            >
              {loading === "report"
                ? "Loading Final Report..."
                : "Refresh Final Report"}
            </button>

            {report && (
              <div className="mt-6 p-5 rounded-xl border border-green-900 bg-green-950/20">

                <p className="text-green-400 font-semibold">
                  ✓ OriginX Pipeline Completed
                </p>

                <p className="text-sm text-slate-400 mt-2">
                  {report.message}
                </p>

              </div>
            )}

          </section>
        )}

        {/* ===================================================
            RESET
        =================================================== */}

        {(analysis || generation || audit || privacyAudit || dp) && (
          <div className="flex justify-center mb-10">

            <button
              onClick={resetProject}
              className="px-6 py-2 rounded-lg border border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 transition"
            >
              Start New Dataset
            </button>

          </div>
        )}

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="mt-12 pt-6 border-t border-slate-800 flex justify-between">

          <p className="text-xs text-slate-600">
            OriginX • Privacy-Safe Synthetic Data Platform
          </p>

          <p className="text-xs text-slate-600">
            Prototype v1.0
          </p>

        </footer>

      </main>

    </div>
  );
}


// ===========================================================
// METRIC CARD
// ===========================================================

function MetricCard({ title, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>

    </div>
  );
}


// ===========================================================
// INFO
// ===========================================================

function Info({ label, value }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="font-semibold mt-2">
        {value}
      </p>

    </div>
  );
}


export default App;