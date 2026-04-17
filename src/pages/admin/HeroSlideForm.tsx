import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { heroService } from '@/services/heroService';
import { HeroSlideInput } from '@/types/hero';
import { supabase } from '@/integrations/supabase/client';

const HeroSlideForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<HeroSlideInput>({
        title: '',
        subtitle: '',
        description: '',
        cta_text: '',
        image: '',
        display_order: 0,
        is_active: true
    });

    useEffect(() => {
        if (isEdit && id) {
            fetchSlide();
        }
    }, [isEdit, id]);

    const fetchSlide = async () => {
        setLoading(true);
        try {
            if (!id) return;
            const slide = await heroService.getSlideById(id);
            if (slide) {
                setFormData({
                    title: slide.title,
                    subtitle: slide.subtitle,
                    description: slide.description,
                    cta_text: slide.cta_text,
                    image: slide.image,
                    display_order: slide.display_order,
                    is_active: slide.is_active
                });
            }
        } catch (error) {
            console.error('Error fetching slide:', error);
            toast({
                title: "Error",
                description: "Failed to fetch slide details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, is_active: checked }));
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('hero-images')
                .upload(filePath, file);

            if (uploadError) {
                // Fallback: try product-images if hero-images doesn't exist?
                // Or just throw
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('hero-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image: data.publicUrl }));
            toast({
                title: "Success",
                description: "Image uploaded successfully",
            });
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast({
                title: "Upload Failed",
                description: error.message || "Could not upload image",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit && id) {
                await heroService.updateSlide(id, formData);
                toast({
                    title: "Success",
                    description: "Slide updated successfully",
                });
            } else {
                await heroService.createSlide(formData);
                toast({
                    title: "Success",
                    description: "Slide created successfully",
                });
            }
            navigate('/admin/hero');
        } catch (error: any) {
            console.error('Error saving slide:', error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[#B38B46]" />
            </div>
        );
    }

    const CardStyle = "bg-[var(--color-surface-card)] border-[0.5px] border-[var(--color-border-default)] rounded-[12px] shadow-sm hover:border-[var(--color-brand-red)] hover:shadow-[0_8px_24px_rgba(0,113,220,0.1)] transition-all duration-220";
    const InputStyle = "h-[40px] px-3 bg-[var(--color-surface-card)] border-[1.5px] border-[var(--color-border-default)] rounded-[8px] text-[14px] text-[var(--color-text-primary)] focus:border-[var(--color-brand-red)] focus:outline-none transition-colors w-full";
    const LabelStyle = "text-[var(--color-text-secondary)] text-[12px] font-[500] mb-1.5 block tracking-wide";

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-[#D4B6A2]/20 pb-6">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/admin/hero')}
                        className="text-[#5C4638] hover:text-[#4A1C1F] hover:bg-[#F9F9F7] p-0 mb-2 h-auto"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        <span className="uppercase tracking-widest text-xs">Back to List</span>
                    </Button>
                    <h1 className="text-[28px] font-[500] text-[var(--color-text-primary)] tracking-[-0.02em]">
                        {isEdit ? 'Edit Slide' : 'Add New Slide'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className={CardStyle}>
                    <CardHeader className="border-b border-[var(--color-border-default)] pb-4 px-5">
                        <CardTitle className="text-[17px] font-[500] text-[var(--color-text-primary)]">Slide Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className={LabelStyle}>Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className={InputStyle}
                                    placeholder="e.g. Unapologetic Elegance"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subtitle" className={LabelStyle}>Subtitle *</Label>
                                <Input
                                    id="subtitle"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    required
                                    className={InputStyle}
                                    placeholder="e.g. The Signature Collection"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className={LabelStyle}>Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className={InputStyle}
                                placeholder="Slide description text..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="cta_text" className={LabelStyle}>CTA Text *</Label>
                                <Input
                                    id="cta_text"
                                    name="cta_text"
                                    value={formData.cta_text}
                                    onChange={handleChange}
                                    required
                                    className={InputStyle}
                                    placeholder="e.g. Discover"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="display_order" className={LabelStyle}>Display Order</Label>
                                <Input
                                    id="display_order"
                                    name="display_order"
                                    type="number"
                                    value={formData.display_order}
                                    onChange={handleChange}
                                    className={InputStyle}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className={LabelStyle}>Slide Image *</Label>

                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-1 w-full relative">
                                    {formData.image ? (
                                        <div className="relative w-full h-48 bg-gray-100 overflow-hidden border border-[#D4B6A2]/20">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 rounded-none"
                                                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[var(--color-border-default)] hover:border-[var(--color-brand-red)] bg-[var(--color-surface-page)] rounded-[8px] cursor-pointer hover:bg-[var(--color-brand-red-light)] transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {uploading ? (
                                                        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-red)]" />
                                                    ) : (
                                                        <>
                                                            <Upload className="w-8 h-8 mb-3 text-[var(--color-brand-red)]" />
                                                            <p className="text-sm text-[var(--color-text-primary)] font-medium tracking-wide">Click to upload image</p>
                                                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">SVG, PNG, JPG or WEBP</p>
                                                        </>
                                                    )}
                                                </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="w-full md:w-1/3 space-y-2">
                                    <Label htmlFor="image_url" className={LabelStyle}>Or Image URL</Label>
                                    <Input
                                        id="image_url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className={InputStyle}
                                    />
                                    <p className="text-xs text-[#7E5A34]">
                                        Upload an image or paste a URL directly.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={handleCheckboxChange}
                                className="data-[state=checked]:bg-[var(--color-brand-red)] border-[var(--color-border-default)] rounded-[4px]"
                            />
                            <Label htmlFor="is_active" className={LabelStyle}>Active</Label>
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/hero')}
                        className="h-[40px] px-6 bg-transparent border-[1.5px] border-[var(--color-brand-red)] text-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-light)] rounded-[8px] font-[500] text-[14px] transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || uploading}
                        className="h-[40px] px-8 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white rounded-[8px] font-[500] text-[14px] transition-all duration-200 hover:-translate-y-[1px] min-w-[120px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEdit ? 'Update Slide' : 'Create Slide')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default HeroSlideForm;

