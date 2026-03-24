"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import {toast} from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { apiConfig, authFetch } from "@/lib/config";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Copy,
    Check,
    Settings,
    Zap,
    Globe,
    Shield,
    Clock,
    Users,
    Hash,
    BarChart3,
    AlertCircle,
    CheckCircle2,
    Timer,
    Edit,
    Save,
    Eye,
    FileText,
} from "lucide-react";
import CopyButton from "@/components/copy-button"

interface EventData {
    name: string;
    user: string;
    refer: string;
    userComment: string;
    referComment: string;
    caps: string;
    time: string;
    payMode: string;
    capSwitch: boolean;
    timeSwitch: boolean;
    dailySwitch: boolean;
    dailyCaps: string;
}

export default function EditCampaignContent({
    campaignId,
}: {
    campaignId: string
}) {
    const router = useRouter();
    const domain = window.location.origin;
    const [campaignInfo, setCampaignInfo] = useState({
        name: "",
        offerID: "",
        tracking: "",
        delay: "",
    });
    const [settings, setSettings] = useState({
        paytm: false,
        ip: false,
        same: false,
        crDelay: false,
        prevEvent: true,
        userPending: false,
        referPending: false,
    });
    const [events, setEvents] = useState<EventData[]>([]);
    const [ip, setIp] = useState<string[]>([]);
    const [newEvent, setNewEvent] = useState<EventData>({
        name: "",
        user: "",
        refer: "",
        userComment: "",
        referComment: "",
        caps: "",
        time: "",
        payMode: "auto",
        capSwitch: false,
        timeSwitch: false,
        dailySwitch: false,
        dailyCaps: "",
    });
    const [newIp, setNewIp] = useState("");
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [addIpModalOpen, setAddIpModalOpen] = useState(false);

    const { data: campaign, isLoading } = useQuery({
        queryKey: ["campaign", campaignId],
        queryFn: async () => {
            const res = await authFetch(
                `${apiConfig.baseUrl}/get/campaign/${campaignId}`,
            );
            return res.json();
        },
        enabled: !!campaignId,
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await authFetch(`${apiConfig.baseUrl}/update/campaign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: campaignId, data }),
            });
            return res.json();
        },
        // onSuccess: (data) => {
        //     if (data.status === true) {
        //         toast.success("Campaign updated successfully!");
        //     } else {
        //         toast.error(data.msg || "Failed to update");
        //     }
        // },
    });

    useEffect(() => {
        if (campaign?.data) {
            const c = campaign.data;
            setCampaignInfo({
                name: c.name || "",
                offerID: c.offerID || "",
                tracking: c.tracking || "",
                delay: c.delay || "",
            });
            setSettings({
                paytm: c.paytm || false,
                ip: c.ip || false,
                same: c.same || false,
                crDelay: c.crDelay || false,
                prevEvent: c.prevEvent !== false,
                userPending: c.userPending || false,
                referPending: c.referPending || false,
            });
            setEvents(c.events || []);
            setIp(c.ips || []);
        }
    }, [campaign]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setCampaignInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSettingChange = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const addEvent = () => {
        if (!newEvent.name || !newEvent.user || !newEvent.refer) {
            toast.error("Event name, user amount and refer amount required");
            return;
        }
        if (!newEvent.userComment || !newEvent.referComment) {
            toast.error("User comment and refer comment required");
            return;
        }
        setEvents((prev) => [...prev, newEvent]);
        setNewEvent({
            name: "",
            user: "",
            refer: "",
            userComment: "",
            referComment: "",
            caps: "",
            time: "",
            payMode: "auto",
            capSwitch: false,
            timeSwitch: false,
            dailySwitch: false,
            dailyCaps: "",
        });
        setEventModalOpen(false);
        toast.success("Event added successfully");
    };

    const deleteEvent = (index: number) => {
        setEvents((prev) => prev.filter((_, i) => i !== index));
        toast.success("Event removed");
    };

    const addIP = () => {
        if (!newIp) return;
        if (ip.includes(newIp)) {
            toast.error("IP already exists");
            return;
        }
        setIp((prev) => [...prev, newIp]);
        setNewIp("");
        setAddIpModalOpen(false);
        toast.success("IP added");
    };

    const deleteIP = (ipToDelete: string) => {
        setIp((prev) => prev.filter((item) => item !== ipToDelete));
        toast.success("IP removed");
    };

    const handleSubmit = () => {
        const sendData = {
            ...campaignInfo,
            ...settings,
            events,
            ips: ip,
        };
        toast.promise(updateMutation.mutateAsync(sendData), {
            loading: "Updating Campaign...",
            success: (data) => data.msg || "Campaign updated successfully!",
            error: (error) => error.message || "Failed to update",
        });
    };

    const totalEventsAmount = events.reduce(
        (acc, e) => acc + (parseFloat(e.user) || 0),
        0,
    );

    if (isLoading) {
        return (
            <div className="space-y-6  w-full">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Skeleton className="h-64" />
                <Skeleton className="h-48" />
            </div>
        );
    }

    return (
        <div className="space-y-6  w-full">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/dashboard/liveCampaigns")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
                        <p className="text-muted-foreground">
                            Update campaign configuration
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1">
                        <Zap className="h-3 w-3" />
                        {events.length} Events
                    </Badge>
                    <Button
                        variant="outline"
                        render={<Link href={`/dashboard/camp/view/${campaignId}`} />}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                    </Button>
                    <Button
                        variant="outline"
                        render={<Link href={`/dashboard/camp/report/${campaignId}`} />}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Report
                    </Button>
                </div>
            </div>

            {/* Campaign Info Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Campaign Details</CardTitle>
                            <CardDescription>
                                Basic information for your campaign
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="tracking">Click URL</Label>
                        <CopyButton text={apiConfig.baseUrl + `/api/v1/click/${campaignId}/?aff_click_id={user_number}&sub_aff_id={refer_number}&userIp={ip}&device={user_agent}&number={number}`} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                Campaign Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g., Summer Sale 2024"
                                value={campaignInfo.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="offerID" className="flex items-center gap-2">
                                Offer ID <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="offerID"
                                name="offerID"
                                type="number"
                                placeholder="e.g., 12345"
                                value={campaignInfo.offerID}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="tracking">Tracking URL</Label>
                        <textarea
                            id="tracking"
                            name="tracking"
                            className="flex min-h-[80px] w-full rounded-lg border border-input  px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none font-mono"
                            placeholder="https://example.com/track?click_id={click_id}"
                            value={campaignInfo.tracking}
                            onChange={handleChange}
                        />
                    </div>

                    {campaign.data.postbackToken && (
                        <div className="space-y-3">
                            <Label htmlFor="tracking">Local Postback</Label>
                            <CopyButton text={apiConfig.baseUrl + `/api/v1/campaign/postback/${campaign.data.postbackToken}/{event}?click={click_id}&p1={pass extra params}`} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Events Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Zap className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle>Events</CardTitle>
                                <CardDescription>
                                    Configure payout events for this campaign
                                </CardDescription>
                            </div>
                        </div>
                        <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
                            <DialogTrigger>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-500" />
                                        Add New Event
                                    </DialogTitle>
                                    <DialogDescription>
                                        Configure the event details and payout amounts
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>
                                            Event Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            placeholder="e.g., Install, Signup, Purchase"
                                            value={newEvent.name}
                                            onChange={(e) =>
                                                setNewEvent((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-1">
                                                User Amount <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={newEvent.user}
                                                onChange={(e) =>
                                                    setNewEvent((prev) => ({
                                                        ...prev,
                                                        user: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-1">
                                                Refer Amount <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={newEvent.refer}
                                                onChange={(e) =>
                                                    setNewEvent((prev) => ({
                                                        ...prev,
                                                        refer: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label>
                                            User Comment <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            placeholder="e.g., Thank you for signing up!"
                                            value={newEvent.userComment}
                                            onChange={(e) =>
                                                setNewEvent((prev) => ({
                                                    ...prev,
                                                    userComment: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>
                                            Refer Comment <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            placeholder="e.g., Bonus for referring a friend!"
                                            value={newEvent.referComment}
                                            onChange={(e) =>
                                                setNewEvent((prev) => ({
                                                    ...prev,
                                                    referComment: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                            Limits & Controls
                                        </h4>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Hash className="h-4 w-4 text-muted-foreground" />
                                                <Label htmlFor="capSwitch">Total Limit (Caps)</Label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {newEvent.capSwitch && (
                                                    <Input
                                                        type="number"
                                                        placeholder="Max count"
                                                        className="w-24 h-8"
                                                        value={newEvent.caps}
                                                        onChange={(e) =>
                                                            setNewEvent((prev) => ({
                                                                ...prev,
                                                                caps: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                )}
                                                <Switch
                                                    id="capSwitch"
                                                    checked={newEvent.capSwitch}
                                                    onCheckedChange={(checked) =>
                                                        setNewEvent((prev) => ({
                                                            ...prev,
                                                            capSwitch: checked,
                                                            caps: checked ? prev.caps : "",
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-muted-foreground" />
                                                <Label htmlFor="dailySwitch">Daily Limit</Label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {newEvent.dailySwitch && (
                                                    <Input
                                                        type="number"
                                                        placeholder="Max daily"
                                                        className="w-24 h-8"
                                                        value={newEvent.dailyCaps}
                                                        onChange={(e) =>
                                                            setNewEvent((prev) => ({
                                                                ...prev,
                                                                dailyCaps: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                )}
                                                <Switch
                                                    id="dailySwitch"
                                                    checked={newEvent.dailySwitch}
                                                    onCheckedChange={(checked) =>
                                                        setNewEvent((prev) => ({
                                                            ...prev,
                                                            dailySwitch: checked,
                                                            dailyCaps: checked ? prev.dailyCaps : "",
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <Label htmlFor="timeSwitch">
                                                    Track Next Event After Time
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {newEvent.timeSwitch && (
                                                    <Input
                                                        type="number"
                                                        placeholder="Minutes"
                                                        className="w-24 h-8"
                                                        value={newEvent.time}
                                                        onChange={(e) =>
                                                            setNewEvent((prev) => ({
                                                                ...prev,
                                                                time: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                )}
                                                <Switch
                                                    id="timeSwitch"
                                                    checked={newEvent.timeSwitch}
                                                    onCheckedChange={(checked) =>
                                                        setNewEvent((prev) => ({
                                                            ...prev,
                                                            timeSwitch: checked,
                                                            time: checked ? prev.time : "",
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label htmlFor="payMode">Pay Mode</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={
                                                    newEvent.payMode === "auto" ? "default" : "outline"
                                                }
                                                size="sm"
                                                className="flex-1 gap-2"
                                                onClick={() =>
                                                    setNewEvent((prev) => ({ ...prev, payMode: "auto" }))
                                                }
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Auto
                                            </Button>
                                            <Button
                                                variant={
                                                    newEvent.payMode === "manual" ? "default" : "outline"
                                                }
                                                size="sm"
                                                className="flex-1 gap-2"
                                                onClick={() =>
                                                    setNewEvent((prev) => ({
                                                        ...prev,
                                                        payMode: "manual",
                                                    }))
                                                }
                                            >
                                                <Clock className="h-4 w-4" />
                                                Manual
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setEventModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={addEvent}>Add Event</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {events.length > 0 ? (
                        <div className="space-y-3">
                            {events.map((event, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{event.name}</p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>
                                                    User:{" "}
                                                    <span className="font-medium text-foreground">
                                                        ₹{event.user}
                                                    </span>
                                                </span>
                                                <span>
                                                    Refer:{" "}
                                                    <span className="font-medium text-foreground">
                                                        ₹{event.refer}
                                                    </span>
                                                </span>
                                                <Badge
                                                    variant={
                                                        event.payMode === "auto" ? "default" : "secondary"
                                                    }
                                                >
                                                    {event.payMode}
                                                </Badge>
                                            </div>
                                            {(event.capSwitch ||
                                                event.dailySwitch ||
                                                event.timeSwitch) && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {event.capSwitch && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <Hash className="h-3 w-3 mr-1" />
                                                                Cap: {event.caps}
                                                            </Badge>
                                                        )}
                                                        {event.dailySwitch && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Daily: {event.dailyCaps}
                                                            </Badge>
                                                        )}
                                                        {event.timeSwitch && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <Timer className="h-3 w-3 mr-1" />
                                                                {event.time}min
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => deleteEvent(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <span className="text-sm text-muted-foreground">
                                    Total Payout Amount
                                </span>
                                <span className="text-xl font-bold">
                                    ₹{totalEventsAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                            <div className="p-4 rounded-full bg-muted mb-4">
                                <Zap className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold mb-1">No events added</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Add events to define your payout structure
                            </p>
                            <Button
                                size="sm"
                                onClick={() => setEventModalOpen(true)}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add First Event
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Blocked IPs Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-destructive/10">
                                <Shield className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <CardTitle>Blocked IPs</CardTitle>
                                <CardDescription>
                                    Prevent payments from specific IP addresses
                                </CardDescription>
                            </div>
                        </div>
                        <Dialog open={addIpModalOpen} onOpenChange={setAddIpModalOpen}>
                            <DialogTrigger>
                                <Button size="sm" variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add IP
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-destructive" />
                                        Block IP Address
                                    </DialogTitle>
                                    <DialogDescription>
                                        Enter an IP address to block from payments
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>IP Address</Label>
                                        <Input
                                            placeholder="e.g., 192.168.1.1"
                                            value={newIp}
                                            onChange={(e) => setNewIp(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addIP()}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setAddIpModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={addIP} className="gap-2">
                                        <Shield className="h-4 w-4" />
                                        Block IP
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {ip.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {ip.map((ipAddress, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="gap-2 px-3 py-1"
                                >
                                    <span className="font-mono">{ipAddress}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 hover:text-destructive"
                                        onClick={() => deleteIP(ipAddress)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="p-3 rounded-full bg-muted mb-3">
                                <Globe className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No blocked IPs</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Settings Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Settings className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle>Campaign Settings</CardTitle>
                            <CardDescription>
                                Configure fraud prevention and payment rules
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="paytm" className="cursor-pointer">
                                    One Paytm One Payment
                                </Label>
                            </div>
                            <Switch
                                id="paytm"
                                checked={settings.paytm}
                                onCheckedChange={() => handleSettingChange("paytm")}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="ip" className="cursor-pointer">
                                    One IP One Payment
                                </Label>
                            </div>
                            <Switch
                                id="ip"
                                checked={settings.ip}
                                onCheckedChange={() => handleSettingChange("ip")}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="same" className="cursor-pointer">
                                    Same Number Refer
                                </Label>
                            </div>
                            <Switch
                                id="same"
                                checked={settings.same}
                                onCheckedChange={() => handleSettingChange("same")}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="prevEvent" className="cursor-pointer">
                                    Reject if Previous event not found
                                </Label>
                            </div>
                            <Switch
                                id="prevEvent"
                                checked={settings.prevEvent}
                                onCheckedChange={() => handleSettingChange("prevEvent")}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Timer className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="crDelay" className="cursor-pointer">
                                    Click to Conversion Delay
                                </Label>
                            </div>
                            <Switch
                                id="crDelay"
                                checked={settings.crDelay}
                                onCheckedChange={() => handleSettingChange("crDelay")}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <Label htmlFor="referPending" className="cursor-pointer">
                                    Pending Refer CashBack
                                </Label>
                            </div>
                            <Switch
                                id="referPending"
                                checked={settings.referPending}
                                onCheckedChange={() => handleSettingChange("referPending")}
                            />
                        </div>
                    </div>

                    {settings.crDelay && (
                        <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-4">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label htmlFor="delay" className="text-sm font-medium">
                                        Conversion Delay (seconds)
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Wait time before recording a conversion
                                    </p>
                                </div>
                                <Input
                                    id="delay"
                                    name="delay"
                                    type="number"
                                    placeholder="e.g., 60"
                                    className="w-32"
                                    value={campaignInfo.delay}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4 pb-6">
                <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/liveCampaigns")}
                >
                    Cancel
                </Button>
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                >
                    {updateMutation.isPending ? (
                        <>
                            <Clock className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

        </div>
    );
}
