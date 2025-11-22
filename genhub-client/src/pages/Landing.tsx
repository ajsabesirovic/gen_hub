import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
	Users,
	CalendarCheck,
	Clock,
	Sparkles,
	HeartHandshake,
	ShieldCheck,
	ArrowRight,
} from "lucide-react";

export default function Landing() {
	return (
		<>
		<Navbar />
		<section className="relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
			<div className="mx-auto max-w-5xl px-6 pt-24 pb-8">
					<div className="grid lg:grid-cols-2 gap-10 items-center">
						<div>
							<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
								Care, support, and connection — made simple
							</h1>
							<p className="mt-4 text-lg text-muted-foreground">
								GenHub connects seniors with volunteers for everyday help — scheduling,
								companionship, errands and more — when it matters the most.
							</p>
							<div className="mt-6 flex flex-wrap gap-3">
								<Button asChild>
									<Link to="/user/tasks">Browse tasks</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link to="/user/availability">Set your availability</Link>
								</Button>
							</div>
							<div className="mt-6 flex items-center gap-3 text-sm">
								<Badge variant="secondary" className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Safe & vetted</Badge>
								<Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Flexible hours</Badge>
								<Badge variant="secondary" className="flex items-center gap-1"><HeartHandshake className="w-3 h-3" /> Community-driven</Badge>
							</div>
						</div>
						<div className="relative">
							<div className="aspect-[4/3] rounded-xl border bg-card p-6 shadow-md">
								<div className="h-full w-full rounded-lg bg-gradient-to-br from-primary/20 via-accent/20 to-transparent" />
							</div>
							<div className="absolute -bottom-3 -right-3 rotate-6">
								<Badge className="px-3 py-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> It's that easy</Badge>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-5xl px-6 py-12">
				<h2 className="text-2xl md:text-3xl font-bold">What GenHub offers</h2>
				<p className="text-muted-foreground mt-2">A modern platform designed for seniors and volunteers to coordinate meaningful help.</p>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
					<Card className="transition hover:shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Volunteers & Seniors</CardTitle>
							<CardDescription>Connect easily and safely, with clear profiles and preferences.</CardDescription>
						</CardHeader>
						<CardContent className="text-sm text-muted-foreground">Build trust with transparent roles and needs. Seniors can request help, and volunteers can pick tasks that fit their schedule.</CardContent>
					</Card>
					<Card className="transition hover:shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-primary" /> Smart availability</CardTitle>
							<CardDescription>Weekly or monthly — fine-tune when you're free to help.</CardDescription>
						</CardHeader>
						<CardContent className="text-sm text-muted-foreground">Choose recurring weekly slots or specific dates for the month. Tasks show up only when they match your availability.</CardContent>
					</Card>
					<Card className="transition hover:shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-primary" /> Thoughtful tasks</CardTitle>
							<CardDescription>From companionship to errands — pick what you enjoy.</CardDescription>
						</CardHeader>
						<CardContent className="text-sm text-muted-foreground">Clear duration, location, and details help you decide quickly. In doubt? Chat and confirm the scope before starting.</CardContent>
					</Card>
				</div>
			</section>

		<section className="bg-muted/30 border-t border-b">
			<div className="mx-auto max-w-5xl px-6 py-12 grid lg:grid-cols-2 gap-10 items-center">
					<div>
						<h3 className="text-2xl md:text-3xl font-bold">For Volunteers</h3>
						<p className="text-muted-foreground mt-2">Give back on your terms. Flexible hours, impactful tasks, real connections.</p>
						<ul className="mt-6 space-y-3 text-sm text-muted-foreground">
							<li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 text-primary" /> Set weekly or monthly availability to only see tasks that fit you.</li>
							<li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 text-primary" /> Choose from companionship, errands, assistance, and more.</li>
							<li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 text-primary" /> Build a meaningful routine and make a difference locally.</li>
						</ul>
						<div className="mt-6">
							<Button asChild>
								<Link to="/user/tasks">Find a task</Link>
							</Button>
						</div>
					</div>
					<div className="rounded-xl border bg-card p-6 shadow-sm">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="rounded-lg bg-primary/5 p-4">
								<p className="font-semibold">Matched tasks</p>
								<p className="text-muted-foreground">Only see tasks during your available times.</p>
							</div>
							<div className="rounded-lg bg-primary/5 p-4">
								<p className="font-semibold">Instant overview</p>
								<p className="text-muted-foreground">Clear duration, location, and category.</p>
							</div>
							<div className="rounded-lg bg-primary/5 p-4">
								<p className="font-semibold">Safe & verified</p>
								<p className="text-muted-foreground">Profiles and roles are transparent.</p>
							</div>
							<div className="rounded-lg bg-primary/5 p-4">
								<p className="font-semibold">Mobile friendly</p>
								<p className="text-muted-foreground">Quick actions and responsive UI.</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section>
				<div className="mx-auto max-w-6xl px-6 py-12 grid lg:grid-cols-2 gap-10 items-center">
					<div className="order-2 lg:order-1 rounded-xl border bg-card p-6 shadow-sm">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="rounded-lg bg-accent/20 p-4">
								<p className="font-semibold">Request help</p>
								<p className="text-muted-foreground">Describe your need and preferred time.</p>
							</div>
							<div className="rounded-lg bg-accent/20 p-4">
								<p className="font-semibold">Get matched</p>
								<p className="text-muted-foreground">Volunteers see your task when they're free.</p>
							</div>
							<div className="rounded-lg bg-accent/20 p-4">
								<p className="font-semibold">Stay in touch</p>
								<p className="text-muted-foreground">Confirm details and keep a simple routine.</p>
							</div>
							<div className="rounded-lg bg-accent/20 p-4">
								<p className="font-semibold">Reliable support</p>
								<p className="text-muted-foreground">Trusted people, clear expectations.</p>
							</div>
						</div>
					</div>
					<div className="order-1 lg:order-2">
						<h3 className="text-2xl md:text-3xl font-bold">For Seniors & Families</h3>
						<p className="text-muted-foreground mt-2">A calm and reliable way to request day-to-day help — exactly when you need it.</p>
						<div className="mt-6">
							<Button variant="outline" asChild>
								<Link to="/login">Create a request</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

		<section className="bg-muted/30 border-t border-b">
			<div className="mx-auto max-w-5xl px-6 py-16">
				<div className="text-center mb-12">
					<h3 className="text-2xl md:text-3xl font-bold">Flexible availability</h3>
					<p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Pick weekly slots (e.g., every Monday 12–14) or exact dates in the month (e.g., 5th, 10th, 15th).</p>
				</div>
				<div className="flex justify-center">
					<Card className="w-full max-w-sm border-2 shadow-lg">
						<CardHeader>
							<CardTitle className="text-center">Preview your schedule</CardTitle>
							<CardDescription className="text-center">Select dates to see how it works</CardDescription>
						</CardHeader>
					<CardContent className="flex justify-center">
						<Calendar
							mode="multiple"
							className="rounded-md border-0"
							disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
							classNames={{
								today: "bg-primary text-white rounded-md data-[selected=true]:rounded-none hover:bg-green-600",
							}}
						/>
					</CardContent>
					</Card>
				</div>
			</div>
		</section>

			
			<section className="mx-auto max-w-5xl px-6 py-16">
				<div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-accent/10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
					<div>
						<h4 className="text-xl md:text-2xl font-bold">Ready to start?</h4>
						<p className="text-muted-foreground mt-1">Join our caring community and make everyday support effortless.</p>
					</div>
					<div className="flex gap-3">
						<Button variant="outline" size="lg" asChild>
							<Link to="/login">Login</Link>
						</Button>
						<Button size="lg" asChild>
							<Link to="/register">Get Started</Link>
						</Button>
					</div>
				</div>
			</section>
		</>
	);
}

