import { LoadBalancingPdf, UserSession } from "@/types/load-balace-types";

export const loadBalancingService = {
  async getPdfs(): Promise<LoadBalancingPdf[]> {
    try {
      const response = await fetch("/api/loadBalancing");
      if (!response.ok) {
        throw new Error("Failed to fetch PDFs");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      return [];
    }
  },

  async uploadPdf(formData: FormData) {
    try {
      const response = await fetch("/api/loadBalancing", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "PDF upload failed");
      }

      return await response.json();
    } catch (error) {
      console.error("PDF upload error:", error);
      throw error;
    }
  },

  async downloadPdf(id: string, title: string) {
    try {
      const response = await fetch(`/api/loadBalancing/${id}`);
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("PDF download error:", error);
      throw new Error("Failed to download PDF");
    }
  },

  async deletePdf(id: string) {
    try {
      const response = await fetch(`/api/loadBalancing/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      return true;
    } catch (error) {
      console.error("PDF delete error:", error);
      throw new Error("Failed to delete PDF");
    }
  },
};
