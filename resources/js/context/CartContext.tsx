// contexts/CartContext.tsx
import { PanelLayout, ProductData } from "@/types/canvas";
import axios from "axios";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { router } from "@inertiajs/react";
import RedirectModal from "@/Components/RedirectModal";

interface SavedDesignMetadata {
    imagePosition?: { x: number; y: number };
    zoomLevel?: number;
    price?: number;
    layout?: PanelLayout | null;
    panelImages?: Record<string, string>;
    panelEffects?: Record<string, string | number>;
    createdAt?: number;
}

interface SavedDesign {
    id: number;
    thumbnail: string;
    status: "Draft" | "Finalized" | "Carted";
}

interface CartItem {
    id: string;
    cart_item_id?: number;
    saved_design_id?: number;
    productId: number;
    size: string;
    quantity: number;
    imageEffect: string | number;
    edgeDesign: string | number;
    hangingMechanism: string;
    hangingVariety?: number;
    imageUrl: string;
    imagePosition: { x: number; y: number };
    zoomLevel: number;
    price: number;
    productData: ProductData | null;
    createdAt: number;
    layout: PanelLayout | null;
    frameThickness?: number;
    panelImages: Record<string, string>;
    panelEffects: Record<string, string | number>;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "id" | "createdAt">) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    cartCount: number;
    cartTotal: number;
    isLoading: boolean;
    isAuthenticated: boolean;
    checkAuthentication: () => Promise<boolean>;
}

type Attribute = {
    attribute_name: string;
    attribute_value: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const validateImageUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("blob:") || url.startsWith("data:")) return url;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/storage/")) return url;
    return `/storage/${url}`;
};

const isValidAttributeValue = (value: any): value is string | number => {
    if (value === null || value === undefined) return false;
    if (value === 0 || value === "0") return false;
    if (value === "" || value === "null" || value === "undefined") return false;
    // Also check for negative numbers which are likely invalid
    if (typeof value === "number" && value < 0) return false;
    if (typeof value === "string" && !isNaN(Number(value)) && Number(value) < 0)
        return false;
    return true;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [tempCartItem, setTempCartItem] = useState<Omit<
        CartItem,
        "id" | "createdAt"
    > | null>(null);
    const [showRedirectModal, setShowRedirectModal] = useState<boolean>(false);
    const checkAuthentication = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await axios.get("/shopping-cart/check-auth");
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            setIsAuthenticated(false);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                // Store temp cart item if exists
                if (tempCartItem) {
                    localStorage.setItem(
                        "tempCartItem",
                        JSON.stringify(tempCartItem)
                    );
                }

                // Set the current URL as intended URL for post-login redirect
                try {
                    const currentUrl = window.location.href;
                    await axios.post("/shopping-cart/set-intended-url", {
                        intended_url: currentUrl,
                    });
                } catch (setUrlError) {
                    console.error("Failed to set intended URL:", setUrlError);
                }

                // Show redirect modal briefly before redirecting
                setShowRedirectModal(true);

                // Redirect to login after a short delay
                setTimeout(() => {
                    router.visit("/login");
                }, 1500);

                return false;
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [tempCartItem]);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/shopping-cart/customer");
                if (response.data.status === "success") {
                    const cartFromAPI = await Promise.all(
                        response.data.data.map(async (item: any) => {
                            // Extract attributes
                            const attributes =
                                item.saved_design.attributes || [];
                            const attrMap = attributes.reduce(
                                (acc: Record<string, string>, attr: any) => {
                                    acc[attr.attribute_name] =
                                        attr.attribute_value;
                                    return acc;
                                },
                                {}
                            ); // Parse metadata
                            let metadata: SavedDesignMetadata = {};
                            try {
                                metadata =
                                    typeof item.saved_design.metadata ===
                                    "string"
                                        ? JSON.parse(item.saved_design.metadata)
                                        : item.saved_design.metadata || {};
                            } catch (error) {
                                console.error("Error parsing metadata", error);
                            }

                            // Get product variation details
                            const variation =
                                item.saved_design.product_variation;
                            const productId = variation?.id || 0;
                            const size = variation?.label || "";

                            // Get image URL
                            let imageUrl = "";
                            if (item.saved_design.thumbnail) {
                                imageUrl = validateImageUrl(
                                    item.saved_design.thumbnail
                                );
                            } else if (
                                item.saved_design.images?.[0]?.image_url
                            ) {
                                imageUrl = validateImageUrl(
                                    item.saved_design.images[0].image_url
                                );
                            } // Get price - use the correctly calculated unit price from backend
                            let price = parseFloat(item.unit_price || "0"); // Get product data if available
                            let productData: ProductData | null = null;
                            // Note: Product data fetching disabled as the endpoint doesn't exist
                            // All necessary product information should already be available in cart items
                            // if (variation?.product) {
                            //     try {
                            //         const productResponse = await axios.get(
                            //             `/api/products/${variation.product.id}`
                            //         );
                            //         if (
                            //             productResponse.data.status ===
                            //             "success"
                            //         ) {
                            //             productData = productResponse.data.data;
                            //         }
                            //     } catch (error) {
                            //         console.error(
                            //             "Failed to fetch product data",
                            //             error
                            //         );
                            //     }
                            // }

                            return {
                                id: item.cart_item_id.toString(),
                                cart_item_id: item.cart_item_id,
                                saved_design_id: item.saved_design.id,
                                productId,
                                size,
                                quantity: item.quantity,
                                imageEffect: attrMap.image_effect_id || "",
                                edgeDesign: attrMap.edge_design_id || "",
                                hangingMechanism:
                                    attrMap.hanging_mechanism || "No",
                                hangingVariety:
                                    attrMap.hanging_mechanism_variety_id
                                        ? parseInt(
                                              attrMap.hanging_mechanism_variety_id
                                          )
                                        : undefined,
                                imageUrl,
                                imagePosition: metadata.imagePosition || {
                                    x: 0,
                                    y: 0,
                                },
                                zoomLevel: metadata.zoomLevel || 100,
                                price,
                                productData,
                                createdAt: new Date(item.added_at).getTime(),
                                layout: metadata.layout || null,
                                frameThickness: attrMap.frame_thickness_id
                                    ? parseInt(attrMap.frame_thickness_id)
                                    : undefined,
                                panelImages: metadata.panelImages || {},
                                panelEffects: metadata.panelEffects || {},
                            };
                        })
                    );

                    setCart(cartFromAPI);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Failed to fetch cart data", error);
                setIsAuthenticated(false);
                const savedCart = localStorage.getItem("canvasCart");
                if (savedCart) {
                    try {
                        setCart(JSON.parse(savedCart));
                    } catch (error) {
                        console.error("Failed to parse cart data", error);
                        localStorage.removeItem("canvasCart");
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCart();

        const tempItem = localStorage.getItem("tempCartItem");
        if (tempItem) {
            try {
                setTempCartItem(JSON.parse(tempItem));
            } catch (error) {
                console.error("Failed to parse temp cart item", error);
            }
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated && cart.length > 0) {
            localStorage.setItem("canvasCart", JSON.stringify(cart));
        }
    }, [cart, isAuthenticated]);

    const addToCart = useCallback(
        async (item: Omit<CartItem, "id" | "createdAt">) => {
            const isAuth = await checkAuthentication();
            if (!isAuth) {
                setTempCartItem(item);
                return;
            }

            setIsLoading(true);

            try {
                // Prepare metadata
                const metadata = {
                    imagePosition: item.imagePosition,
                    zoomLevel: item.zoomLevel,
                    price: item.price,
                    layout: item.layout,
                    panelImages: item.panelImages,
                    panelEffects: item.panelEffects,
                    createdAt: Date.now(),
                };

                // Convert image to blob if needed
                let imageBlob: Blob | null = null;
                if (
                    item.imageUrl.startsWith("blob:") ||
                    item.imageUrl.startsWith("data:")
                ) {
                    try {
                        const response = await fetch(item.imageUrl);
                        imageBlob = await response.blob();
                    } catch (error) {
                        console.error("Error fetching image blob:", error);
                        return;
                    }
                } else {
                    console.error(
                        "Cannot process image URL format:",
                        item.imageUrl
                    );
                    return;
                }

                // Create FormData
                const formData = new FormData();
                formData.append(
                    "product_variation_id",
                    item.productId.toString()
                );
                formData.append("status", "Finalized");
                formData.append("metadata", JSON.stringify(metadata));

                // Add thumbnail
                const thumbnailFile = new File([imageBlob], "thumbnail.jpg", {
                    type: imageBlob.type || "image/jpeg",
                });
                formData.append("thumbnail", thumbnailFile); // Prepare attributes
                const attributes: Attribute[] = [
                    {
                        attribute_name: "hanging_mechanism",
                        attribute_value: item.hangingMechanism.toLowerCase(),
                    },
                ]; // Add image effect if valid and not empty/zero
                if (isValidAttributeValue(item.imageEffect)) {
                    attributes.push({
                        attribute_name: "image_effect_id",
                        attribute_value: item.imageEffect.toString(),
                    });
                } // Add frame thickness if valid and not empty/zero
                console.log(
                    "Checking frameThickness:",
                    item.frameThickness,
                    "is valid:",
                    isValidAttributeValue(item.frameThickness)
                );
                if (isValidAttributeValue(item.frameThickness)) {
                    console.log(
                        "Adding frame_thickness_id attribute:",
                        item.frameThickness
                    );
                    attributes.push({
                        attribute_name: "frame_thickness_id",
                        attribute_value: item.frameThickness.toString(),
                    });
                } else {
                    console.log(
                        "Skipping frame_thickness_id - invalid value:",
                        item.frameThickness
                    );
                }

                // Add edge design if valid and not empty/zero
                if (isValidAttributeValue(item.edgeDesign)) {
                    attributes.push({
                        attribute_name: "edge_design_id",
                        attribute_value: item.edgeDesign.toString(),
                    });
                } // Add hanging variety if valid and not empty/zero
                if (isValidAttributeValue(item.hangingVariety)) {
                    attributes.push({
                        attribute_name: "hanging_mechanism_variety_id",
                        attribute_value: item.hangingVariety.toString(),
                    });
                }

                // Debug: Log the attributes being sent
                console.log("Attributes being sent to API:", attributes);
                console.log("Item values:", {
                    imageEffect: item.imageEffect,
                    frameThickness: item.frameThickness,
                    edgeDesign: item.edgeDesign,
                    hangingVariety: item.hangingVariety,
                });

                // Append attributes
                attributes.forEach((attr, index) => {
                    formData.append(
                        `attributes[${index}][attribute_name]`,
                        attr.attribute_name
                    );
                    formData.append(
                        `attributes[${index}][attribute_value]`,
                        attr.attribute_value
                    );
                });

                // Add image
                const imageFile = new File([imageBlob], "image.jpg", {
                    type: imageBlob.type || "image/jpeg",
                });
                formData.append("images[0][image_file]", imageFile);
                formData.append("images[0][position]", "0");

                // Save design
                const saveDesignResponse = await axios.post(
                    "/saved-designs",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                const savedDesignId = saveDesignResponse.data.data.id;
                const cartResponse = await axios.post("/shopping-cart/add", {
                    saved_design_id: savedDesignId,
                    quantity: item.quantity,
                });

                // Construct new cart item
                const newItem: CartItem = {
                    ...item,
                    id: cartResponse.data.data.id.toString(),
                    cart_item_id: cartResponse.data.data.id,
                    saved_design_id: savedDesignId,
                    createdAt: Date.now(),
                    imageUrl:
                        validateImageUrl(
                            saveDesignResponse.data.data.thumbnail
                        ) || item.imageUrl,
                };
                setCart((prev) => [...prev, newItem]);
            } catch (error) {
                console.error("Error adding item to cart:", error);
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 401
                ) {
                    setTempCartItem(item);

                    // Set the current URL as the intended URL for post-login redirect
                    try {
                        const currentUrl = window.location.href;
                        await axios.post("/shopping-cart/set-intended-url", {
                            intended_url: currentUrl,
                        });
                    } catch (setUrlError) {
                        console.error(
                            "Failed to set intended URL:",
                            setUrlError
                        );
                    }

                    // Show redirect modal briefly before redirecting
                    setShowRedirectModal(true);

                    // Redirect to login after a short delay
                    setTimeout(() => {
                        router.visit("/login");
                    }, 1500);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [checkAuthentication]
    );
    useEffect(() => {
        const addTempItemToCart = async () => {
            if (isAuthenticated && tempCartItem) {
                // Show modal when returning from login
                setShowRedirectModal(true);

                // Add the temp item back to cart
                await addToCart(tempCartItem);
                setTempCartItem(null);
                localStorage.removeItem("tempCartItem");

                // Hide modal after processing
                setTimeout(() => {
                    setShowRedirectModal(false);
                }, 2000);
            }
        };

        addTempItemToCart();
    }, [isAuthenticated, tempCartItem, addToCart]);

    const removeFromCart = useCallback(
        async (id: string) => {
            const isAuth = await checkAuthentication();
            if (!isAuth) return;

            try {
                setIsLoading(true);
                const item = cart.find((item) => item.id === id);

                if (item?.cart_item_id) {
                    await axios.delete(
                        `/shopping-cart/delete/${item.cart_item_id}`
                    );
                }

                setCart((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
                console.error("Error removing item from cart:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [cart, checkAuthentication]
    );
    const updateQuantity = useCallback(
        async (id: string, quantity: number) => {
            const isAuth = await checkAuthentication();
            if (!isAuth) return;

            try {
                setIsLoading(true);
                const item = cart.find((item) => item.id === id);

                if (item?.cart_item_id) {
                    await axios.put(
                        `/shopping-cart/update/${item.cart_item_id}`,
                        {
                            quantity: Math.max(1, quantity),
                        }
                    );
                }

                setCart((prev) =>
                    prev.map((item) =>
                        item.id === id
                            ? { ...item, quantity: Math.max(1, quantity) }
                            : item
                    )
                );
            } catch (error) {
                console.error("Error updating cart item quantity:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [cart, checkAuthentication]
    );
    const clearCart = useCallback(async () => {
        const isAuth = await checkAuthentication();
        if (!isAuth) return;

        try {
            setIsLoading(true);
            const deletePromises = cart.map((item) => {
                if (item.cart_item_id) {
                    return axios.delete(
                        `/shopping-cart/delete/${item.cart_item_id}`
                    );
                }
                return Promise.resolve();
            });

            await Promise.all(deletePromises);
            setCart([]);
        } catch (error) {
            console.error("Error clearing cart:", error);
        } finally {
            setIsLoading(false);
        }
    }, [cart, checkAuthentication]);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isLoading,
                isAuthenticated,
                checkAuthentication,
            }}
        >
            {children}
            <RedirectModal
                isOpen={showRedirectModal}
                message={
                    isAuthenticated && tempCartItem
                        ? "Successfully logged in! Redirecting you back to your design..."
                        : "Redirecting you to login..."
                }
                onClose={() => setShowRedirectModal(false)}
            />
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
