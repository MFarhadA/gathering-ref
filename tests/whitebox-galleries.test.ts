/**
 * White Box Testing - Basis Path Testing
 * Based on Muhammad Farhad Ajilla's Pengujian Perangkat Lunak documentation
 */

import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock the Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock the utils
jest.mock("@/lib/utils", () => ({
  nanoid: jest.fn(() => "test-slug-1234"),
}));

import { createClient } from "@/lib/supabase/server";

interface MockUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

interface MockGallery {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  share_slug?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  images?: MockImage[];
}

interface MockImage {
  id: string;
  gallery_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

// Helper to create chainable mock
const createChainableMock = (defaultValue: unknown) => {
  const mockFn = jest.fn().mockReturnValue(defaultValue);
  return mockFn;
};

// Helper for eq().eq().single() chain
const createQueryChain = (data: unknown, error: unknown) => {
  const result = { data, error };
  return {
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue(result),
        }),
      }),
    }),
  };
};

describe("White Box Testing - Basis Path Testing (Galleries API)", () => {
  let mockSupabase: any;

  const mockUser: MockUser = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: { full_name: "Test User" },
  };

  const mockGallery: MockGallery = {
    id: "gallery-123",
    name: "Test Gallery",
    description: "Test Description",
    is_public: false,
    share_slug: undefined,
    user_id: "user-123",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockImage: MockImage = {
    id: "image-123",
    gallery_id: "gallery-123",
    user_id: "user-123",
    file_name: "test.jpg",
    file_path: "user-123/gallery-123/test.jpg",
    file_size: 1024,
    created_at: new Date().toISOString(),
  };

  const mockStorage = {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
      remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: "https://storage.test.com/test.jpg" },
      }),
    }),
  };

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        signOut: jest.fn(),
      },
      from: jest.fn(),
      storage: mockStorage,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  // ============================================
  // SC 3: GET /api/galleries (6 Independent Paths)
  // ============================================
  describe("GET /api/galleries (SC 3)", () => {
    const testGetGalleries = async () => {
      const { GET } = await import("@/app/api/galleries/route");
      return GET();
    };

    it("SC3-01: Should return 401 Unauthorized when user is null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      const response = await testGetGalleries();
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("SC3-02: Should return 500 when database error occurs", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error occurred" },
            }),
          }),
        }),
      });

      const response = await testGetGalleries();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Database error occurred");
    });

    it("SC3-03: Should return empty array when user has no galleries", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const response = await testGetGalleries();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual([]);
    });

    it("SC3-04: Should return gallery with image_count: 0 and cover_url: null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "galleries") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [{ ...mockGallery, images: [] }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const response = await testGetGalleries();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body[0].image_count).toBe(0);
      expect(body[0].cover_url).toBeNull();
    });

    it("SC3-05: Should return gallery with image_count > 0 but cover_url: null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "galleries") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [{ ...mockGallery, images: [mockImage] }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const response = await testGetGalleries();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body[0].image_count).toBe(1);
      expect(body[0].cover_url).toBeNull();
    });

    it("SC3-06: Should return gallery with valid cover_url", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "galleries") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [{ ...mockGallery, images: [mockImage] }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { file_path: "user-123/gallery-123/cover.jpg" },
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const response = await testGetGalleries();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body[0].image_count).toBe(1);
      expect(body[0].cover_url).toBe("https://storage.test.com/test.jpg");
    });
  });

  // ============================================
  // SC 4: POST /api/galleries (5 Independent Paths)
  // ============================================
  describe("POST /api/galleries (SC 4)", () => {
    const testPostGallery = async (body: Record<string, unknown>) => {
      const { POST } = await import("@/app/api/galleries/route");
      const request = new Request("http://localhost/api/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return POST(request);
    };

    it("SC4-01: Should return 401 when user is null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await testPostGallery({ name: "Test Gallery" });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("SC4-02: Should return 400 when name is missing or invalid", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const response = await testPostGallery({});
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Name is required");
    });

    it("SC4-03: Should return 500 when is_public=false and database error occurs", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      });

      const response = await testPostGallery({ name: "Private Gallery", is_public: false });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Database connection failed");
    });

    it("SC4-04: Should create private gallery with share_slug: null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockGallery, is_public: false, share_slug: null },
              error: null,
            }),
          }),
        }),
      });

      const response = await testPostGallery({ name: "Private Gallery", is_public: false });
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.is_public).toBe(false);
      expect(body.share_slug).toBeNull();
    });

    it("SC4-05: Should create public gallery with generated share_slug", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockGallery, is_public: true, share_slug: "test-slug-1234" },
              error: null,
            }),
          }),
        }),
      });

      const response = await testPostGallery({ name: "Public Gallery", is_public: true });
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.is_public).toBe(true);
      expect(body.share_slug).toBe("test-slug-1234");
    });
  });

  // ============================================
  // SC 5: GET /api/galleries/[id] (4 Independent Paths)
  // ============================================
  describe("GET /api/galleries/[id] (SC 5)", () => {
    const testGetGalleryById = async (galleryId: string) => {
      const { GET } = await import("@/app/api/galleries/[id]/route");
      const request = new Request(`http://localhost/api/galleries/${galleryId}`);
      const params = Promise.resolve({ id: galleryId });
      return GET(request, { params });
    };

    it("SC5-01: Should return 401 when user is null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await testGetGalleryById("gallery-123");
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("SC5-02: Should return 404 when gallery not found or not owned by user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: "Not found" }),
            }),
          }),
        }),
      });

      const response = await testGetGalleryById("non-existent-gallery");
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe("Gallery not found");
    });

    it("SC5-03: Should return gallery with empty images array", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "galleries") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: mockGallery, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const response = await testGetGalleryById("gallery-123");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.id).toBe("gallery-123");
      expect(body.images).toEqual([]);
    });

    it("SC5-04: Should return gallery with images including public URLs", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "galleries") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: mockGallery, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [mockImage],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const response = await testGetGalleryById("gallery-123");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.images).toHaveLength(1);
      expect(body.images[0].url).toBeDefined();
    });
  });

  // ============================================
  // SC 6: PATCH /api/galleries/[id] (8 Independent Paths)
  // ============================================
  describe("PATCH /api/galleries/[id] (SC 6)", () => {
    const testPatchGallery = async (galleryId: string, body: Record<string, unknown>) => {
      const { PATCH } = await import("@/app/api/galleries/[id]/route");
      const request = new Request(`http://localhost/api/galleries/${galleryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const params = Promise.resolve({ id: galleryId });
      return PATCH(request, { params });
    };

    it("SC6-01: Should return 401 when user is null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await testPatchGallery("gallery-123", { name: "New Name" });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("SC6-02: Should return 500 when database update fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockGallery, share_slug: "existing" },
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database update failed" },
                }),
              }),
            }),
          }),
        }),
      });

      const response = await testPatchGallery("gallery-123", {});
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Database update failed");
    });

    it("SC6-03: Should return 200 when sending empty body (only updated_at)", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockGallery, share_slug: "existing" },
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockGallery },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const response = await testPatchGallery("gallery-123", {});
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.id).toBeDefined();
    });

    it("SC6-04: Should return 200 when updating gallery name", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockGallery, share_slug: "existing" },
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockGallery, name: "Updated Name" },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const response = await testPatchGallery("gallery-123", { name: "Updated Name" });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.name).toBe("Updated Name");
    });

    it("SC6-05: Should return 200 when updating gallery description", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockGallery, share_slug: "existing" },
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockGallery, description: "Updated Description" },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const response = await testPatchGallery("gallery-123", { description: "Updated Description" });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.description).toBe("Updated Description");
    });

    it("SC6-06: Should return 200 when setting is_public to false", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockGallery, share_slug: "existing" },
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockGallery, is_public: false },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const response = await testPatchGallery("gallery-123", { is_public: false });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.is_public).toBe(false);
    });

    it("SC6-07: Should keep existing share_slug when making public", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockGallery, share_slug: "existing-slug" },
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockGallery, is_public: true, share_slug: "existing-slug" },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const response = await testPatchGallery("gallery-123", { is_public: true });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.is_public).toBe(true);
      expect(body.share_slug).toBe("existing-slug");
    });

    it("SC6-08: Should generate new share_slug when making public without existing slug", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockGallery, share_slug: undefined },
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockGallery, is_public: true, share_slug: "test-slug-1234" },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const response = await testPatchGallery("gallery-123", { is_public: true });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.is_public).toBe(true);
      expect(body.share_slug).toBe("test-slug-1234");
    });
  });

  // ============================================
  // SC 7: DELETE /api/galleries/[id] (4 Independent Paths)
  // ============================================
  describe("DELETE /api/galleries/[id] (SC 7)", () => {
    const testDeleteGallery = async (galleryId: string) => {
      const { DELETE } = await import("@/app/api/galleries/[id]/route");
      const request = new Request(`http://localhost/api/galleries/${galleryId}`, {
        method: "DELETE",
      });
      const params = Promise.resolve({ id: galleryId });
      return DELETE(request, { params });
    };

    it("SC7-01: Should return 401 when user is null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await testDeleteGallery("gallery-123");
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("SC7-02: Should return 500 when gallery has no images but DB delete fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
        if (table === "galleries") {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  error: { message: "Delete failed" },
                }),
              }),
            }),
          };
        }
        return {};
      });

      const response = await testDeleteGallery("gallery-123");
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Delete failed");
    });

    it("SC7-03: Should return success when deleting gallery with no images", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
        if (table === "galleries") {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const response = await testDeleteGallery("gallery-123");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("SC7-04: Should delete storage files and database record when gallery has images", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [mockImage],
                error: null,
              }),
            }),
          };
        }
        if (table === "galleries") {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const response = await testDeleteGallery("gallery-123");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });

  // ============================================
  // SC 8: POST /api/galleries/[id]/images (8 Independent Paths)
  // ============================================
  describe("POST /api/galleries/[id]/images (SC 8)", () => {
    const createMockFile = (name: string, type: string, size: number): File => {
      // Create a buffer with exact size
      const buffer = new ArrayBuffer(size);
      const blob = new Blob([buffer], { type });
      return new File([blob], name, { type });
    };

    const testPostImage = async (galleryId: string, file: File | null) => {
      const { POST } = await import("@/app/api/galleries/[id]/images/route");
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }

      const request = new Request(`http://localhost/api/galleries/${galleryId}/images`, {
        method: "POST",
        body: formData,
      });
      const params = Promise.resolve({ id: galleryId });
      return POST(request, { params });
    };

    beforeEach(() => {
      // Reset storage mock
      mockStorage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: "https://storage.test.com/test.jpg" },
        }),
      });
    });

    it("SC8-01: Should return 401 when user is null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const file = createMockFile("test.jpg", "image/jpeg", 1024);
      const response = await testPostImage("gallery-123", file);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("SC8-02: Should return 404 when gallery not found or not owned", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: "Not found" }),
            }),
          }),
        }),
      });

      const file = createMockFile("test.jpg", "image/jpeg", 1024);
      const response = await testPostImage("non-existent-gallery", file);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe("Gallery not found");
    });

    it("SC8-03: Should return 400 when no file is provided", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: "gallery-123" }, error: null }),
            }),
          }),
        }),
      });

      const response = await testPostImage("gallery-123", null);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("No file provided");
    });

    it("SC8-04: Should return 400 when file type is not an image", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: "gallery-123" }, error: null }),
            }),
          }),
        }),
      });

      const file = createMockFile("test.pdf", "application/pdf", 1024);
      const response = await testPostImage("gallery-123", file);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("File must be an image");
    });

    it("SC8-05: Should return 400 when file exceeds 10MB limit", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: "gallery-123" }, error: null }),
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockImage, error: null }),
          }),
        }),
      });

      const file = createMockFile("large.jpg", "image/jpeg", 11 * 1024 * 1024);
      const response = await testPostImage("gallery-123", file);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("File too large (max 10MB)");
    });

    it("SC8-06: Should return 500 when storage upload fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: "gallery-123" }, error: null }),
            }),
          }),
        }),
      });

      mockStorage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Storage upload failed" },
        }),
      });

      const file = createMockFile("test.jpg", "image/jpeg", 1024);
      const response = await testPostImage("gallery-123", file);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Storage upload failed");
    });

    it("SC8-07: Should cleanup storage and return 500 when DB insert fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "galleries") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: { id: "gallery-123" }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === "images") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database insert failed" },
                }),
              }),
            }),
          };
        }
        return {};
      });

      mockStorage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      const file = createMockFile("test.jpg", "image/jpeg", 1024);
      const response = await testPostImage("gallery-123", file);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Database insert failed");
    });

    it("SC8-08: Should return 201 with image data and URL on success", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "galleries") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: { id: "gallery-123" }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === "images") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockImage },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      mockStorage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: "https://storage.test.com/test.jpg" },
        }),
      });

      const file = createMockFile("test.jpg", "image/jpeg", 1024);
      const response = await testPostImage("gallery-123", file);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.id).toBe("image-123");
      expect(body.url).toBeDefined();
    });
  });

  // ============================================
  // SC 9: DELETE /api/galleries/[id]/images/[imageId] (4 Independent Paths)
  // ============================================
  describe("DELETE /api/galleries/[id]/images/[imageId] (SC 9)", () => {
    const testDeleteImage = async (galleryId: string, imageId: string) => {
      const { DELETE } = await import("@/app/api/galleries/[id]/images/[imageId]/route");
      const request = new Request(`http://localhost/api/galleries/${galleryId}/images/${imageId}`, {
        method: "DELETE",
      });
      const params = Promise.resolve({ id: galleryId, imageId });
      return DELETE(request, { params });
    };

    it("SC9-01: Should return 401 when user is null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await testDeleteImage("gallery-123", "image-123");
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("SC9-02: Should return 404 when image not found or not owned", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: "Not found" }),
              }),
            }),
          }),
        }),
      });

      const response = await testDeleteImage("gallery-123", "non-existent-image");
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe("Image not found");
    });

    it("SC9-03: Should return 500 when database delete fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockImage, error: null }),
                  }),
                }),
              }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: { message: "Delete failed" },
              }),
            }),
          };
        }
        return {};
      });

      mockStorage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      const response = await testDeleteImage("gallery-123", "image-123");
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Delete failed");
    });

    it("SC9-04: Should delete storage and database record, return success", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "images") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockImage, error: null }),
                  }),
                }),
              }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      });

      mockStorage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      });

      const response = await testDeleteImage("gallery-123", "image-123");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});
