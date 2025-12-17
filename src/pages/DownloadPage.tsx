import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLocaleFromPath } from "../hooks/useLocaleFromPath";
import {
  CheckCircle2,
  Command,
  Download,
  FileDigit,
  FileText,
  Github,
  Info,
  Laptop,
  Monitor,
  Package,
  SquareTerminal,
  X,
} from "lucide-react";
import { AdSense } from "../components/AdSense";

import WindowsIcon from "/Floorp_Platform_Windows_Gradient.png";
import MacIcon from "/Floorp_Platform_Mac_Gradient.png";
import LinuxIcon from "/Floorp_Platform_Linux_Gradient.png";

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  name: string;
}

type Platform = "windows" | "mac" | "linux";

export default function DownloadPage() {
  const { t } = useTranslation();
  useLocaleFromPath();
  const [releaseInfo, setReleaseInfo] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Platform>("windows");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  // Download Delay State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isDownloadModalOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isDownloadModalOpen && countdown === 0 && pendingDownloadUrl) {
      window.location.href = pendingDownloadUrl;
      const closeTimer = setTimeout(() => {
        setIsDownloadModalOpen(false);
        setPendingDownloadUrl(null);
        setCountdown(4);
      }, 1000);
      return () => clearTimeout(closeTimer);
    }
    return () => clearTimeout(timer);
  }, [isDownloadModalOpen, countdown, pendingDownloadUrl]);

  const handleDownload = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    if (isDownloadModalOpen) return;

    setPendingDownloadUrl(url);
    setCountdown(4);
    setIsDownloadModalOpen(true);
  };

  const closeDownloadModal = () => {
    setIsDownloadModalOpen(false);
    setPendingDownloadUrl(null);
    setCountdown(4);
  };

  useEffect(() => {
    document.title = t("downloadPage.pageTitle");

    // Detect OS
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) {
      setActiveTab("windows");
    } else if (ua.includes("mac")) {
      setActiveTab("mac");
    } else if (ua.includes("linux")) {
      setActiveTab("linux");
    }
  }, [t]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const CopyButton = ({ text }: { text: string }) => (
    <button
      className="btn btn-square btn-sm btn-ghost absolute right-2 top-2"
      onClick={() => handleCopy(text)}
      aria-label="Copy to clipboard"
    >
      {copiedCommand === text
        ? <CheckCircle2 size={16} className="text-success" />
        : <FileText size={16} />}
    </button>
  );

  // Remove 'v' prefix from version
  const formatVersion = (version: string | undefined) => {
    if (!version) return "";
    return version.startsWith("v") ? version.substring(1) : version;
  };

  useEffect(() => {
    async function fetchLatestRelease() {
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.github.com/repos/Floorp-Projects/Floorp/releases/latest",
        );

        if (!response.ok) {
          throw new Error(
            `GitHub API responded with status: ${response.status}`,
          );
        }

        const data = await response.json();
        setReleaseInfo(data);
      } catch (err) {
        console.error("Error fetching release data:", err);
        setError("Failed to fetch latest release information");
        setReleaseInfo(null);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestRelease();
  }, []);

  // Format release date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get version without 'v' prefix
  const version = formatVersion(releaseInfo?.tag_name);

  // Get the hash file URL
  const getHashesUrl = () => {
    if (!releaseInfo?.tag_name) return "#";
    return `https://github.com/Floorp-Projects/Floorp/releases/download/${releaseInfo.tag_name}/hashes.txt`;
  };

  // Generate download URLs based on version
  const getWindowsDownloadUrl = () => {
    if (!version) return "#";
    return `https://github.com/Floorp-Projects/Floorp/releases/download/${releaseInfo?.tag_name}/floorp-windows-x86_64.installer.exe`;
  };

  const getWindowsStubInstallerUrl = () => {
    if (!version) return "#";
    return `https://github.com/Floorp-Projects/Floorp/releases/download/${releaseInfo?.tag_name}/floorp-stub.installer.exe`;
  };

  const getPortableDownloadUrl = () => {
    return "https://github.com/Floorp-Projects/Floorp-Portable-v2/releases/latest/download/floorp-windows-x86_64.portable.7z";
  };

  const getMacOSDownloadUrl = () => {
    if (!version) return "#";
    return `https://github.com/Floorp-Projects/Floorp/releases/download/${releaseInfo?.tag_name}/floorp-macOS-universal.dmg`;
  };

  const getLinuxDownloadUrl = () => {
    if (!version) return "#";
    return `https://github.com/Floorp-Projects/Floorp/releases/download/${releaseInfo?.tag_name}/floorp-linux-x86_64.tar.xz`;
  };

  const getLinuxAArch64DownloadUrl = () => {
    if (!version) return "#";
    return `https://github.com/Floorp-Projects/Floorp/releases/download/${releaseInfo?.tag_name}/floorp-linux-aarch64.tar.xz`;
  };

  const isDownloadDisabled = !releaseInfo || !!error;

  return (
    <section className="py-16 px-4 md:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("downloadPage.title")}
          </h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            {t("downloadPage.subtitle")}
          </p>
        </div>

        {/* Download Delay Modal */}
        {isDownloadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-base-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold">
                    {countdown > 0
                      ? t("downloadPage.downloadingIn", { count: countdown })
                      : t("downloadPage.pleaseWait")}
                  </h3>
                  <button
                    onClick={closeDownloadModal}
                    className="btn btn-sm btn-circle btn-ghost"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-6">
                  {/* Top Ad */}
                  <div className="w-full flex justify-center bg-base-200 rounded-xl p-2 min-h-[100px]">
                    <AdSense
                      client="ca-pub-9988710026850454"
                      slot="7741827366"
                      className="block w-full"
                      style={{ minHeight: "90px" }}
                    />
                  </div>

                  {countdown > 0
                    ? (
                      <div className="relative w-24 h-24 my-4">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-base-300"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 -
                              (251.2 * (4 - countdown)) / 4}
                            className="text-primary transition-all duration-1000 ease-linear"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                          {countdown}
                        </div>
                      </div>
                    )
                    : (
                      <div className="loading loading-spinner loading-lg text-primary my-4">
                      </div>
                    )}

                  <div className="w-full flex justify-center bg-base-200 rounded-xl p-2 min-h-[100px]">
                    <AdSense
                      client="ca-pub-9988710026850454"
                      slot="9350244892"
                      className="block w-full"
                      style={{ minHeight: "90px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-8 shadow-lg">
            <Info className="stroke-current shrink-0 h-6 w-6" />
            <span>
              {error}{" "}
              - Please try again later or check the GitHub releases page
              directly.
            </span>
            <a
              href="https://github.com/Floorp-Projects/Floorp/releases"
              className="btn btn-sm btn-ghost"
            >
              View Releases
            </a>
          </div>
        )}

        {/* Platform Tabs */}
        <div className="tabs tabs-boxed justify-center mb-8 bg-base-200/50 p-2 rounded-2xl inline-flex w-full md:w-auto overflow-x-auto flex-nowrap">
          <a
            className={`tab tab-lg transition-all duration-200 flex-nowrap whitespace-nowrap ${
              activeTab === "windows"
                ? "tab-active shadow-sm !bg-primary !text-primary-content rounded-xl"
                : "hover:bg-base-200"
            }`}
            onClick={() => setActiveTab("windows")}
          >
            <Monitor className="w-4 h-4 mr-2" />
            Windows
          </a>
          <a
            className={`tab tab-lg transition-all duration-200 flex-nowrap whitespace-nowrap ${
              activeTab === "mac"
                ? "tab-active shadow-sm !bg-primary !text-primary-content rounded-xl"
                : "hover:bg-base-200"
            }`}
            onClick={() => setActiveTab("mac")}
          >
            <Command className="w-4 h-4 mr-2" />
            macOS
          </a>
          <a
            className={`tab tab-lg transition-all duration-200 flex-nowrap whitespace-nowrap ${
              activeTab === "linux"
                ? "tab-active shadow-sm !bg-primary !text-primary-content rounded-xl"
                : "hover:bg-base-200"
            }`}
            onClick={() => setActiveTab("linux")}
          >
            <Laptop className="w-4 h-4 mr-2" />
            Linux
          </a>
        </div>

        {/* Main Content Area */}
        <div className="mb-16 min-h-[400px]">
          {/* Windows Content */}
          {activeTab === "windows" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6 flex items-center gap-3">
                    <img
                      src={WindowsIcon}
                      width={32}
                      height={32}
                      alt="Windows"
                    />
                    {t("downloadPage.windowsInstaller")}
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-base-100 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">
                          {t("downloadPage.onlineInstaller")}
                        </span>
                        <span className="badge badge-success badge-sm">
                          {t("downloadPage.smallSize")}
                        </span>
                      </div>
                      <p className="text-sm opacity-70 mb-4">
                        {t("downloadPage.onlineInstallerDesc")}
                      </p>
                      <button
                        onClick={(e) =>
                          handleDownload(e, getWindowsStubInstallerUrl())}
                        className={`btn btn-primary w-full ${
                          isDownloadDisabled ? "btn-disabled" : ""
                        }`}
                      >
                        <Download size={18} />
                        {t("downloadPage.windowsStubInstaller")}
                      </button>
                    </div>

                    <div className="divider">OR</div>

                    <div className="p-4 bg-base-100 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">
                          {t("downloadPage.offlineInstaller")}
                        </span>
                        <span className="badge badge-ghost badge-sm">
                          {t("downloadPage.fullSize")}
                        </span>
                      </div>
                      <p className="text-sm opacity-70 mb-4">
                        {t("downloadPage.offlineInstallerDesc")}
                      </p>
                      <button
                        onClick={(e) =>
                          handleDownload(e, getWindowsDownloadUrl())}
                        className={`btn btn-outline w-full ${
                          isDownloadDisabled ? "btn-disabled" : ""
                        }`}
                      >
                        <Download size={18} />
                        {t("downloadPage.windowsDownloadFull")}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <a
                      href={getHashesUrl()}
                      className="link link-hover text-xs opacity-60 flex items-center justify-center gap-1"
                    >
                      <FileDigit size={12} />
                      {t("downloadPage.downloadHashes")}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="card bg-base-200 shadow-xl border border-base-300">
                  <div className="card-body">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Info size={20} /> {t("downloadPage.systemRequirements")}
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-success" />
                        {t("downloadPage.reqWindows")}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-success" />
                        {t("downloadPage.reqProc")}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-success" />
                        {t("downloadPage.reqRam")}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-xl border border-base-300">
                  <div className="card-body">
                    <h3 className="font-bold text-lg mb-4">
                      {t("downloadPage.otherOptions")}
                    </h3>
                    <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg mb-3">
                      <div className="flex items-center gap-3">
                        <Package size={20} />
                        <div>
                          <div className="font-semibold">
                            {t("downloadPage.portableVersion")}
                          </div>
                          <div className="text-xs opacity-60">
                            {t("downloadPage.portableDesc")}
                          </div>
                        </div>
                      </div>
                      <a
                        href={getPortableDownloadUrl()}
                        className="btn btn-sm btn-ghost"
                      >
                        {t("navbar.download")}
                      </a>
                    </div>

                    <div className="divider my-2"></div>

                    <h4 className="font-bold text-sm mb-2">
                      {t("downloadPage.winget")}
                    </h4>
                    <div className="mockup-code bg-base-100 text-base-content p-0 before:hidden text-xs relative group">
                      <pre className="p-3 overflow-x-auto"><code>winget install Floorp</code></pre>
                      <CopyButton text="winget install Floorp" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* macOS Content */}
          {activeTab === "mac" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6 flex items-center gap-3">
                    <img src={MacIcon} width={32} height={32} alt="macOS" />
                    {t("downloadPage.macInstaller")}
                  </h2>

                  <div className="p-4 bg-base-100 rounded-xl mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">
                        {t("downloadPage.universalBinary")}
                      </span>
                      <span className="badge badge-info badge-sm">
                        {t("downloadPage.intelSilicon")}
                      </span>
                    </div>
                    <p className="text-sm opacity-70 mb-4">
                      {t("downloadPage.macDesc")}
                    </p>
                    <button
                      onClick={(e) => handleDownload(e, getMacOSDownloadUrl())}
                      className={`btn btn-primary w-full btn-lg ${
                        isDownloadDisabled ? "btn-disabled" : ""
                      }`}
                    >
                      <Download size={24} />
                      {t("downloadPage.macDownload")}
                    </button>
                  </div>

                  <div className="text-center opacity-60 text-sm">
                    <p>{t("downloadPage.macInstallGuide")}</p>
                  </div>

                  <div className="mt-4 text-center">
                    <a
                      href={getHashesUrl()}
                      className="link link-hover text-xs opacity-60 flex items-center justify-center gap-1"
                    >
                      <FileDigit size={12} />
                      {t("downloadPage.downloadHashes")}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="card bg-base-200 shadow-xl border border-base-300">
                  <div className="card-body">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Info size={20} /> {t("downloadPage.systemRequirements")}
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-success" />
                        {t("downloadPage.reqMac")}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-success" />
                        {t("downloadPage.reqMacProc")}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-xl border border-base-300">
                  <div className="card-body">
                    <h3 className="font-bold text-lg mb-4">
                      {t("downloadPage.homebrew")}
                    </h3>
                    <div className="mockup-code bg-base-100 text-base-content p-0 before:hidden text-xs relative group mb-2">
                      <pre className="p-3 overflow-x-auto"><code>brew install --cask floorp</code></pre>
                      <CopyButton text="brew install --cask floorp" />
                    </div>
                    <a
                      href="https://formulae.brew.sh/cask/floorp"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-link"
                    >
                      {t("downloadPage.viewHomebrew")}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Linux Content */}
          {activeTab === "linux" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <div className="card bg-base-200 shadow-xl border border-base-300">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6 flex items-center gap-3">
                    <img src={LinuxIcon} width={32} height={32} alt="Linux" />
                    {t("downloadPage.linuxPackages")}
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-base-100 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">
                          {t("downloadPage.tarballX64")}
                        </span>
                        <span className="badge badge-neutral badge-sm">
                          {t("downloadPage.standard")}
                        </span>
                      </div>
                      <button
                        onClick={(e) =>
                          handleDownload(e, getLinuxDownloadUrl())}
                        className={`btn btn-primary w-full mb-2 ${
                          isDownloadDisabled ? "btn-disabled" : ""
                        }`}
                      >
                        <Download size={18} />
                        {t("downloadPage.downloadTar")}
                      </button>
                    </div>

                    <div className="p-4 bg-base-100 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">
                          {t("downloadPage.tarballArm")}
                        </span>
                        <span className="badge badge-neutral badge-sm">
                          {t("downloadPage.arm")}
                        </span>
                      </div>
                      <button
                        onClick={(e) =>
                          handleDownload(e, getLinuxAArch64DownloadUrl())}
                        className={`btn btn-outline w-full ${
                          isDownloadDisabled ? "btn-disabled" : ""
                        }`}
                      >
                        <Download size={18} />
                        {t("downloadPage.downloadTarArm")}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <a
                      href={getHashesUrl()}
                      className="link link-hover text-xs opacity-60 flex items-center justify-center gap-1"
                    >
                      <FileDigit size={12} />
                      {t("downloadPage.downloadHashes")}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="card bg-base-200 shadow-xl border border-base-300">
                  <div className="card-body">
                    <h3 className="font-bold text-lg mb-4">
                      {t("downloadPage.packageManagers")}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-semibold">
                            <Package size={16} /> {t("downloadPage.flatpak")}
                          </div>
                          <a
                            href="https://flathub.org/apps/one.ablaze.floorp"
                            target="_blank"
                            rel="noreferrer"
                            className="link link-primary text-xs"
                            onClick={(e) =>
                              handleDownload(
                                e,
                                "https://flathub.org/apps/one.ablaze.floorp",
                              )}
                          >
                            {t("downloadPage.view")}
                          </a>
                        </div>
                        <div className="mockup-code bg-base-100 text-base-content p-0 before:hidden text-xs relative group">
                          <pre className="p-3 overflow-x-auto"><code>flatpak install flathub one.ablaze.floorp</code></pre>
                          <CopyButton text="flatpak install flathub one.ablaze.floorp" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-semibold">
                            <SquareTerminal size={16} /> {t("downloadPage.ppa")}
                          </div>
                          <a
                            href="https://ppa.floorp.app/"
                            target="_blank"
                            rel="noreferrer"
                            className="link link-primary text-xs"
                            onClick={(e) =>
                              handleDownload(e, "https://ppa.floorp.app/")}
                          >
                            {t("downloadPage.setup")}
                          </a>
                        </div>
                        <div className="alert alert-sm bg-base-100 text-xs">
                          curl -fsSL https://ppa.floorp.app/KEY.gpg...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info text-sm">
                  <Info size={16} />
                  <span>{t("downloadPage.archLinux")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Version Info & Other Details */}
        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">
                {t("downloadPage.latestVersion")}
              </h2>
              <div className="overflow-x-auto">
                {loading
                  ? (
                    <div className="flex justify-center p-4">
                      <span className="loading loading-spinner loading-md" />
                    </div>
                  )
                  : error
                  ? <div className="alert alert-warning">{error}</div>
                  : (
                    <table className="table w-full">
                      <tbody>
                        <tr>
                          <td className="font-semibold">
                            {t("downloadPage.latestVersion")}
                          </td>
                          <td className="font-mono">{version || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold">
                            {t("downloadPage.releaseDate")}
                          </td>
                          <td>
                            {formatDate(releaseInfo?.published_at || "")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  to="https://blog.floorp.app/categories/release/"
                  className="btn btn-outline btn-sm flex items-center gap-2"
                >
                  <FileText size={16} />
                  {t("downloadPage.releaseNotes")}
                </Link>

                <a
                  href={getHashesUrl()}
                  className={`btn btn-outline btn-sm flex items-center gap-2 ${
                    isDownloadDisabled ? "btn-disabled" : ""
                  }`}
                >
                  <FileDigit size={16} />
                  {t("downloadPage.downloadHashes")}
                </a>

                <a
                  href="https://github.com/Floorp-Projects/Floorp"
                  className="btn btn-outline btn-sm flex items-center gap-2"
                >
                  <Github size={16} />
                  {t("downloadPage.sourceCode")}
                </a>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">
                {t("downloadPage.legalPrivacy")}
              </h2>
              <p className="text-sm opacity-70 mb-4">
                {t("downloadPage.termsAgreement")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/terms"
                  className="btn btn-ghost btn-sm justify-start"
                >
                  <FileText size={16} className="mr-2" />
                  {t("footer.terms")}
                </Link>
                <Link
                  to="/privacy"
                  className="btn btn-ghost btn-sm justify-start"
                >
                  <Info size={16} className="mr-2" />
                  {t("footer.privacy")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
