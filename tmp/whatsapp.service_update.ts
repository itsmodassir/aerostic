  async getBusinessProfile(tenantId: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const url = "https://graph.facebook.com/" + apiVersion + "/" + creds.phoneNumberId + "/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical&access_token=" + creds.accessToken;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new BadRequestException(data.error?.message || "Failed to fetch profile");
    }

    return data.data?.[0] || data;
  }

  async updateBusinessProfile(tenantId: string, profileData: any) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const allowedFields = ["about", "address", "description", "email", "websites", "vertical"];
    const payload: any = { messaging_product: "whatsapp" };
    
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        payload[field] = profileData[field];
      }
    });

    const url = "https://graph.facebook.com/" + apiVersion + "/" + creds.phoneNumberId + "/whatsapp_business_profile?access_token=" + creds.accessToken;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new BadRequestException(data.error?.message || "Failed to update profile");
    }

    return { success: true, data };
  }

  async uploadProfilePhoto(tenantId: string, file: Buffer, mimetype: string) {
    const creds = await this.getCredentials(tenantId);
    if (!creds) throw new BadRequestException("Account not connected");
    const apiVersion = await this.getApiVersion();

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: mimetype });
    formData.append("file", blob, "profile.jpg");
    formData.append("messaging_product", "whatsapp");
    formData.append("type", "image");

    const mediaRes = await axios.post(
      "https://graph.facebook.com/" + apiVersion + "/" + creds.phoneNumberId + "/media?access_token=" + creds.accessToken,
      formData
    );

    const mediaId = mediaRes.data.id;
    
    const updateUrl = "https://graph.facebook.com/" + apiVersion + "/" + creds.phoneNumberId + "/whatsapp_business_profile?access_token=" + creds.accessToken;
    const updateRes = await fetch(updateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         messaging_product: "whatsapp",
         profile_picture_handle: mediaId
      }),
    });

    const updateData = await updateRes.json();
    if (!updateRes.ok) {
      throw new BadRequestException(updateData.error?.message || "Failed to update profile photo");
    }

    return { success: true, mediaId };
  }

  async saveFlowCanvas(tenantId: string, flowId: string, payload: { name: string; flowData: any }) {
    const flow = await this.automationFlowRepo.findOne({ where: { id: flowId, tenantId } });
    if (!flow) throw new BadRequestException("Flow not found");

    flow.name = payload.name;
    flow.triggerConfig = { ...flow.triggerConfig, canvas: payload.flowData };
    
    await this.automationFlowRepo.save(flow);
    return { success: true };
  }

  async getFlowCanvas(tenantId: string, flowId: string) {
    const flow = await this.automationFlowRepo.findOne({ where: { id: flowId, tenantId } });
    if (!flow) throw new BadRequestException("Flow not found");
    return flow.triggerConfig?.canvas || { nodes: [], edges: [] };
  }
