"use client"

import FileIcon, { LinkedIn, OpenLetter } from "@/components/svg"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

/* helpers */
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export default function Page() {
  /* refs & state */
  const trackRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [collapseT, setCollapseT] = useState(0)
  const [isTablet, setIsTablet] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  /* responsive mode */
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 768px)")
    const mqTablet = window.matchMedia(
      "(min-width: 768px) and (max-width: 1024px)"
    )

    const apply = () => {
      setIsMobile(mqMobile.matches)
      setIsTablet(mqTablet.matches)
    }

    apply()
    mqMobile.addEventListener?.("change", apply)
    mqTablet.addEventListener?.("change", apply)
    return () => {
      mqMobile.removeEventListener?.("change", apply)
      mqTablet.removeEventListener?.("change", apply)
    }
  }, [])
  /* route vertical wheel to horizontal (desktop/tablet only) */
  useEffect(() => {
    if (isMobile) return
    const el = trackRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      el.scrollLeft += delta
      e.preventDefault()
    }
    const onKey = (e: KeyboardEvent) => {
      const step = 120
      if (["ArrowRight", "PageDown"].includes(e.key)) {
        el.scrollLeft += step
        e.preventDefault()
      }
      if (["ArrowLeft", "PageUp"].includes(e.key)) {
        el.scrollLeft -= step
        e.preventDefault()
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("keydown", onKey, { passive: false })
    return () => {
      window.removeEventListener("wheel", onWheel as any)
      window.removeEventListener("keydown", onKey as any)
    }
  }, [isMobile])

  /* drive profile shrink from scroll offset */
  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (isMobile) {
        setCollapseT(clamp01(window.scrollY / 520))
      } else {
        const left = trackRef.current?.scrollLeft ?? 0
        setCollapseT(clamp01(left / 520))
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [isMobile])

  /* reveal animations */
  useEffect(() => {
    const rootEl = isMobile ? null : trackRef.current
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in")
        }),
      { root: rootEl, rootMargin: "0px 12% 0px 12%", threshold: 0.2 }
    )
    const scope: ParentNode = isMobile ? document : trackRef.current ?? document
    const nodes = Array.from(scope.querySelectorAll<HTMLElement>(".reveal"))
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [isMobile])

  /* profile interpolation (avatar/name shrink) */
  const AVATAR_MAX = 206,
    AVATAR_MIN = 28
  const NAME_MAX = 45,
    NAME_MIN = 0
  const aSize = Math.round(lerp(AVATAR_MAX, AVATAR_MIN, collapseT))
  const nSize = lerp(NAME_MAX, NAME_MIN, collapseT)
  const copyOpacity = clamp01(1 - collapseT * 1.35)
  const badgeOpacity = clamp01((collapseT - 0.65) * 3)

  /* sticky profile width → min 200px, max ~square slab (100dvh-4em) */
  const FRAME = 64
  const [profileMaxW, setProfileMaxW] = useState(746)

  useEffect(() => {
    const calc = () => {
      const vh = window.innerHeight || 800
      setProfileMaxW(Math.max(200, vh - FRAME))
    }
    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
  }, [])

  // NEW: choose a base that respects 50% of viewport width on tablets
  const baseMax = (() => {
    if (typeof window === "undefined") return profileMaxW
    if (isTablet)
      return Math.min(profileMaxW, Math.floor(window.innerWidth * 0.5))
    if (!isMobile) return 746 // ← desktop
    return profileMaxW
  })()

  useEffect(() => {
    if (!showHint) return
    let hidden = false
    const hide = () => {
      if (hidden) return
      hidden = true
      setShowHint(false)
      remove()
    }

    const onWheel = () => hide()
    const onScroll = () => hide()
    const onKey = () => hide()
    const onTouch = () => hide()
    const onPointer = () => hide()

    const el = trackRef.current
    if (!isMobile && el)
      el.addEventListener("scroll", onScroll, { passive: true })

    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("keydown", onKey)
    window.addEventListener("touchstart", onTouch, { passive: true })
    window.addEventListener("pointerdown", onPointer, { passive: true })

    const t = setTimeout(hide, 6000)

    function remove() {
      clearTimeout(t)
      if (!isMobile && el) el.removeEventListener("scroll", onScroll as any)
      window.removeEventListener("wheel", onWheel as any)
      window.removeEventListener("scroll", onScroll as any)
      window.removeEventListener("keydown", onKey as any)
      window.removeEventListener("touchstart", onTouch as any)
      window.removeEventListener("pointerdown", onPointer as any)
    }

    return remove
  }, [isMobile, showHint])
  const profileW = Math.round(lerp(baseMax, 200, collapseT))
  const name = "Sam Eseyin"

  return (
    <main className="min-h-dvh flex justify-center items-center">
      <div className="w-full pt-4 md:pl-4 md:pr-2">
        <div
          ref={trackRef}
          className={[
            "hidden md:flex relative bg-[#ECE9E1]",
            "h-[calc(100dvh-4em)] max-h-[812px] w-full",
            "overflow-x-auto overflow-y-hidden",
          ].join(" ")}
        >
          <aside
            className={[
              "sticky left-0 top-0 z-30",
              "h-[calc(100dvh-4em)]",
              "bg-[var(--tangerine)] text-white",
              "flex items-center justify-center whitespace-normal",
              "flex-none",
            ].join(" ")}
            style={mounted ? { width: profileW } : undefined}
          >
            <section className="relative flex h-full w-full md:w-[553px] xl:-w-[753px] flex-col items-center justify-center gap-8 px-6">
              {/* avatar */}
              <div
                className="mx-auto overflow-hidden rounded-full will-change-transform"
                style={{ width: aSize, height: aSize }}
              >
                <Image
                  src="/profile.webp"
                  alt="Sam Eseyin"
                  width={AVATAR_MAX}
                  height={AVATAR_MAX}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              {/* name */}
              <h1
                className="text-center font-lora font-bold tracking-[-1px] leading-[1.1]"
                style={{ fontSize: `${nSize}px`, opacity: copyOpacity }}
              >
                {name}
              </h1>

              {/* paragraph */}
              <p
                className={[
                  "mx-auto max-w-[555px] border-y border-[#CACACA]",
                  "text-[18px] leading-8 font-lora pt-5 pb-4",
                  "break-words hyphens-auto [text-wrap:balance]",
                ].join(" ")}
                style={{ opacity: copyOpacity }}
              >
                I&apos;m a STEM Educator and K-12 Curriculum Developer with over
                a decade of experience. To date, I&apos;ve taught more than
                6,000 students across 18 countries and mentored winners of
                national and international competitions, including{" "}
                <span className="font-bold">
                  the National BETA State Competition in Computer Science (2024
                  &amp; 2025, U.S.)
                </span>{" "}
                and the{" "}
                <span className="font-bold">
                  AI Challenge in Indonesia (2025)
                </span>
                . I&apos;m also one of the pioneers of robotics/STEM education
                in schools across Nigeria.
              </p>

              {/* links */}
              <div
                className="mx-auto flex max-w-[555px] flex-wrap items-center justify-center gap-8 text-[#252323] font-lora font-semibold text-[20px]"
                style={{ opacity: copyOpacity }}
              >
                <span className="w-fit h-6 flex items-center gap-1">
                  <FileIcon />
                  <Link href="/Sam-Eseyin-Resume.pdf" target="_blank">
                    <span className="flex flex-col">
                      Resume
                      <span className="border-b border-dashed border-[#FEFEFE] cursor-pointer"></span>
                    </span>
                  </Link>
                </span>
                <span className="flex items-center gap-1">
                  <LinkedIn />
                  <Link
                    href="https://www.linkedin.com/in/sam-eseyin-125649143"
                    target="_blank"
                  >
                    <span className="flex flex-col">
                      LinkedIn
                      <span className="border-b border-dashed border-[#FEFEFE] cursor-pointer"></span>
                    </span>
                  </Link>
                </span>
                <span className="flex items-center gap-1">
                  <OpenLetter />
                  <Link href="mailto:sam@example.com" target="_blank">
                    <span className="flex flex-col">
                      Email
                      <span className="border-b border-dashed border-[#FEFEFE] cursor-pointer"></span>
                    </span>
                  </Link>
                </span>
              </div>

              {/* initials badge */}
              <div
                className="pointer-events-none absolute px-3 top-6 grid text-sm font-semibold text-white flex-col gap-8"
                style={{
                  opacity: badgeOpacity,
                }}
              >
                {/* avatar */}
                <div className="w-full h-full overflow-hidden rounded-full will-change-transform">
                  <Image
                    src="/profile.webp"
                    alt="Sam Eseyin"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                {/* name */}
                <h1 className="text-[28px] text-left font-lora font-bold tracking-[-1px] leading-[1.1]">
                  {name}
                </h1>
                {/* links */}
                <div className="w-full flex flex-wrap gap-8 text-[#252323] font-lora font-semibold text-[20px]">
                  <span className="w-fit h-6 flex items-center gap-1">
                    <FileIcon />
                    <Link
                      href="/Sam-Eseyin-Resume.pdf"
                      target="_blank"
                      className="cursor-pointer"
                    >
                      <span className="flex flex-col">
                        Resume
                        <span className="border-b border-dashed border-[#FEFEFE] cursor-pointer"></span>
                      </span>
                    </Link>
                  </span>
                  <span className="flex items-center gap-1">
                    <LinkedIn />
                    <Link
                      href="https://www.linkedin.com/in/sam-eseyin-125649143"
                      target="_blank"
                      className="cursor-pointer"
                    >
                      <span className="flex flex-col">
                        LinkedIn
                        <span className="border-b border-dashed border-[#FEFEFE] cursor-pointer"></span>
                      </span>
                    </Link>
                  </span>
                  <span className="flex items-center gap-1">
                    <OpenLetter />
                    <Link
                      href="mailto:sam@example.com"
                      target="_blank"
                      className="cursor-pointer"
                    >
                      <span className="flex flex-col">
                        Email
                        <span className="border-b border-dashed border-[#FEFEFE] cursor-pointer"></span>
                      </span>
                    </Link>
                  </span>
                </div>
              </div>
            </section>
          </aside>

          {/* HORIZONTAL RIBBON (wide row) */}
          <div
            id="wrapper"
            className="h-[calc(100dvh-4em)] w-max flex flex-nowrap items-stretch pr-2"
          >
            {/* (2) the Introduction section */}
            <div className="reveal py-[52px] inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-[832px] grid grid-cols-1 gap-8">
                <div className="w-full mx-10">
                  <p className="w-[584px] border-y border-[#CACACA] font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance] text-left pt-[20px] pb-[18px]">
                    This photo captures the early days of my journey (2017 -
                    2024), during which we pioneered robotics and STEM education
                    in FCT, Nigeria.
                  </p>
                </div>
                <div className="w-full">
                  <div className="relative">
                    <span className="absolute top-2 left-1/4 text-[#EE4926] font-lora font-bold text-[22px]/[40.32px] tracking-normal">
                      Started 2017
                    </span>

                    <Image
                      src="/ideal-teachers.webp"
                      alt=""
                      width={200}
                      height={200}
                      priority
                      className="w-full"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute top-2 left-1/4 text-[#EE4926] font-lora font-bold text-[22px]/[40.32px] tracking-normal">
                      Failed 2024{" "}
                    </span>
                    <Image
                      src="/team-ideal.webp"
                      alt=""
                      width={754}
                      height={754}
                      priority
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <p className="max-w-[548px] font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[32px] pl-10 text-left flex flex-col gap-8">
                <span>
                  <span className="font-bold">My name is Sam Eseyin,</span> and
                  in the 2000s, I was obsessed with robotics movies. They were
                  my escape, sparking a deep curiosity about technology and
                  engineering. By the next decade, that curiosity had grown into
                  a full-blown passion. It pushed me to take bold steps, even
                  when the odds seemed stacked against me.
                </span>
                <span>
                  At the time, I was teaching kids chess in schools. I loved
                  helping them develop strategic thinking, but I couldn&apos;t
                  shake this thought:{" "}
                  <span className="font-bold">
                    What if these kids could learn robotics instead?{" "}
                  </span>{" "}
                  The idea stuck with me, but there was a problem.
                </span>
              </p>
            </div>
            {/* (2)the Chess players section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <Image
                src="/student-chess-players.webp"
                alt=""
                width={754}
                height={754}
                priority
                className="w-full md:w-[754px] h-full object-cover"
              />
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left">
                In the environment I lived in,{" "}
                <span className="font-bold">
                  (a small village called Gbagalape on the outskirts of Abuja,
                  Nigeria),{" "}
                </span>{" "}
                robotics was practically unheard of. Most kids had never even
                seen a robotics kit, let alone understood how to use one. But I
                couldn&apos;t let that stop me. I had to try. With no access to
                fancy kits or resources, I got creative. I downloaded
                schematics, and started pitching the idea to schools. I met with
                school owners and administrators, explaining how robotics could
                reshape the way kids think and learn. A few schools gave me a
                chance, and I stood in front of students and their parents with{" "}
                <span className="font-bold">
                  nothing but printed papers in my hands.
                </span>
              </p>
            </div>
            {/* (3) three guys in red section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full md:w-[754px] h-full">
                <Image
                  src="/three-friends-in red-shirts.webp"
                  alt=""
                  width={754}
                  height={754}
                  priority
                  className="w-full md:w-[754px] h-full object-cover"
                />
              </div>
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left flex flex-col gap-8">
                <span>
                  The kids&apos; excitement was contagious. Their eyes lit up as
                  I explained how robots worked, and I knew I had to do more.
                  But there was one big problem: I didn&apos;t have a single
                  robotics kit to show them. So, I did the only thing I could
                  think of,{" "}
                  <span className="font-bold">
                    I sold the best pair of shoes I owned to scrape together
                    enough money to order my first robotics kit,
                  </span>{" "}
                </span>
                <span>
                  When it finally arrived, I was overjoyed. I spent countless
                  sleepless nights experimenting with it, learning everything I
                  could. I was determined to master it so I could show kids what
                  was possible.
                </span>
              </p>
            </div>
            {/* (4) Two guys standing in suite with Sam section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full h-full">
                <Image
                  src="/sam-in-white-shirt.webp"
                  alt=""
                  width={754}
                  height={754}
                  priority
                  className="w-full md:w-[754px] h-full object-cover"
                />
              </div>
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left flex flex-col gap-8">
                <span>
                  Confident in my new knowledge, I started touring schools in
                  Abuja, demonstrating the kit&apos;s potential. The kids were
                  amazed, and their excitement fueled me. That&apos;s when{" "}
                  <span className="font-bold">Ideal Robotics</span> was born.
                </span>
                <span>
                  Not long after, I met{" "}
                  <span className="font-bold">Malik Gwandu, my co-founder</span>{" "}
                  and one of the most passionate and kindest people I&apos;ve
                  ever known. Together, we became a team on a mission. We went
                  from school to school in Abuja, talking to anyone who would
                  listen about STEM and robotics. We wanted kids to see what was
                  possible to imagine a future where they could build, create,
                  and solve problems.
                </span>
              </p>
            </div>
            {/* (5) Two guys standing in suite with Sam section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full h-full">
                <Image
                  src="/sam-and-malik-in-red.webp"
                  alt=""
                  width={754}
                  height={754}
                  priority
                  className="w-full md:w-[754px] h-full object-cover"
                />
              </div>
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left flex flex-col gap-8">
                <span>
                  Malik had this funny habit of saying,{" "}
                  <span className="font-bold">
                    &quot;Every time we walk into a supermarket, there&apos;s a
                    90% chance some kid will point at us and say, &apos;Hey,
                    Mom, that&apos;s my robotics teacher!&quot;
                  </span>
                  And you know what? He was usually right. Those moments kept us
                  going. After months of free workshops and school visits,{" "}
                  <span className="font-bold">
                    we finally got our first paying client, Lela Blossom School.{" "}
                  </span>{" "}
                  I&apos;ll never forget that feeling. It was like, &quot;Okay,
                  this is real, we&apos;re really doing this.&quot;
                </span>
                <span>
                  We were in demand, but with growth came new challenges.
                  Schools paid us at the end of the term, and I didn&apos;t have
                  enough money to hire the team we needed.
                </span>
              </p>
            </div>
            {/* (6) Two guys standing in suite with Sam section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full h-full">
                <Image
                  src="/robot-outdoor.webp"
                  alt=""
                  width={754}
                  height={754}
                  priority
                  className="w-full md:w-[754px] h-full object-cover"
                />
              </div>
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left flex flex-col gap-8">
                <span>
                  I put out an ad, hoping someone would believe in what we were
                  trying to do. And people did. A group of amazing people joined
                  us, even though we couldn&apos;t promise much. We were paying
                  each person just 50,000 Naira, it was all we could afford at
                  the time. Malik and I weren&apos;t taking any pay; we poured
                  everything back into the company.
                </span>
                <span>
                  We rented a small office space with the little money we had.
                  It was empty, with no chairs, no furniture, just a floor.
                  Every morning, we&apos;d sit on that floor, plan our day, and
                  then head out to schools to teach. I made a promise to my
                  team: I would never owe them a salary.
                </span>
              </p>
            </div>
            {/* (7) Two guys standing in suite with Sam section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full h-full">
                <Image
                  src="/ideal-teachers-on-the-floor.webp"
                  alt=""
                  width={754}
                  height={754}
                  priority
                  className="w-full md:w-[754px] h-full object-cover"
                />
              </div>
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left flex flex-col gap-8">
                <span>
                  Shola, Queensley, Samuel, Victor, and Malik - these were the
                  people who carried Ideal Robotics on their shoulders. They
                  believed in the dream so much that they&pos;d bring me food
                  from home when they knew I hadn&apos;t eaten. I&apos;ll never
                  forget their kindness.
                </span>
                <span>
                  During one of our toughest times, I reached out to Faiz
                  Bashir, the founder of FlexiSAF, who generously provided us
                  with funds that kept us going and truly saved us. As we
                  continued to grow, so did our impact. School owners began
                  referring us to their friends who also ran schools, often
                  saying, “You have to see what these kids are building!”
                </span>
              </p>
            </div>
            {/* (8) Two guys standing in suite with Sam section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full h-full">
                <Image
                  src="/sam-ideal-robotic-red-shirt-with-teacher.webp"
                  alt=""
                  width={754}
                  height={754}
                  priority
                  className="w-full md:w-[754px] h-full object-cover"
                />
              </div>
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left flex flex-col gap-8">
                <span>
                  Parents joined in spreading the word, especially during summer
                  camps, excited to share how their children were building
                  robots, coding, designing mobile apps, and solving real-world
                  problems. They wanted other kids to have the same empowering
                  experience. It was inspiring to watch how word of mouth
                  carried us forward.{" "}
                </span>
                <span>
                  The biggest validation came when some of the schools we worked
                  with began incorporating robotics into their curriculum. After
                  seeing the impact it had on their students and how it sparked
                  creativity, critical thinking, and problem-solving, they made
                  it compulsory.
                </span>
              </p>
            </div>
            {/* (9) Two guys standing in suite with Sam section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full h-full">
                <Image
                  src="/ideal-robotic-student-event.webp"
                  alt=""
                  width={754}
                  height={754}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left flex flex-col gap-8">
                <span>
                  That was a huge win for us. What started as an extracurricular
                  activity was now becoming a core part of education in some
                  schools. We partnered with organizations like, Avion
                  Innovation Hub, MTO Technologies, and the Discovery Museum to
                  reach even more kids. During summer holidays, we ran intensive
                  STEM and coding programs, teaching skills that many kids had
                  never imagined.{" "}
                </span>
                <span>
                  We also took them on excursions to various tech companies and
                  organizations such as the National Center for Artificial
                  Intelligence and Robotics, Flexisaf Edusoft.
                </span>
              </p>
            </div>{" "}
            {/* (10) Two guys standing in suite with Sam section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full h-full">
                <Image
                  src="/ideal-robotic-students.webp"
                  alt=""
                  width={754}
                  height={754}
                  priority
                  className="w-full md:w-[754px] h-full object-cover"
                />
              </div>
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left flex flex-col gap-8">
                <span>
                  <span className="font-bold">
                    After eight years, Ideal Robotics had to shut down.
                  </span>{" "}
                  It was one of the toughest experience I&apos;ve had. Watching
                  something I had built from scratch, something that touched so
                  many lives, come to an end broke my heart. Closing the doors
                  of Ideal Robotics was an incredibly difficult decision. Yet,
                  through that setback, I found clarity.
                </span>
                <span>
                  I realized that the impact we made on students, schools, and
                  my team was only the beginning. I carry that same passion into
                  this next chapter, working to empower even more young minds to
                  dream, create, and innovate.
                </span>
              </p>
            </div>
            {/* (11) Two guys standing in suite with Sam section */}
            <div className="h-full reveal inline-grid flex-none min-w-[1380px] max-w-[1380px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full h-full">
                <Image
                  src="/hoodie-pair.webp"
                  alt=""
                  width={754}
                  height={754}
                  priority
                  className="w-full md:w-[754px] h-full object-cover"
                />
              </div>
              <p className="w-full font-lora font-normal text-[#252323] text-[22.4px] leading-[40.32px] tracking-normal break-words hyphens-auto [text-wrap:balance] py-[52px] px-8 text-left flex flex-col gap-8">
                <span>
                  As I reflect on this journey, I am reminded of the people who
                  stood by me, believed in me, and helped me keep going. My mom,
                  whose unwavering support gave me the courage to dream big. My
                  friend Sefater, who always encouraged me to keep pushing.
                  Abdul-Malik, managing director of Cloud9, whose guidance and
                  mentorship were invaluable, Mr. Thomas, and Samuel Kayode,
                  whose friendship and support kept me grounded. To my team,
                  Patience, Jessica, Keddy, Maxwell, Joes, Sushi, Florentina,
                  Mildred, Chinedu, Chisom, my co-founder Malik, I am forever
                  grateful.{" "}
                  <span className="font-bold">
                    The dream did not end; it evolved. And so will I.
                  </span>
                </span>
              </p>
            </div>
            {/* (11) Two guys standing in suite with Sam section */}
            <div className="h-full reveal inline-grid flex-none min-w-[754px] max-w-[754px] grid-cols-[1.25fr_1fr] overflow-hidden bg-[#ECE9E1]">
              <div className="w-full h-full">
                <Image
                  src="/team-ideal.webp"
                  alt=""
                  fill
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================== MOBILE VERTICAL STACK =================== */}
      <div className="md:hidden pt-2 px-2 pb-8 min-h-[calc(100dvh-4em)]">
        {/* (1) Profile */}
        <section className="reveal flex min-h-[calc(100dvh-4em)] items-center justify-center bg-[var(--tangerine)] p-8 text-white">
          <div className="w-full max-w-[720px] text-center">
            <div
              className="mx-auto overflow-hidden rounded-full will-change-transform"
              style={{ width: aSize, height: aSize }}
            >
              <Image
                src="/profile.webp"
                alt="Sam Eseyin"
                width={AVATAR_MAX}
                height={AVATAR_MAX}
                className="h-full w-full object-cover"
              />
            </div>
            <h1
              className="text-center font-lora font-bold tracking-[-1px] leading-[1.1] pt-4"
              style={{
                fontSize: `${nSize}px`,
              }}
            >
              {name}
            </h1>
            <hr className="mx-auto my-5 h-px w-3/4 border-0 bg-white/30" />
            <p className="mx-auto max-w-[640px] text-[18px] leading-8 text-white/95 text-left">
              I&apos;m a STEM Educator and K-12 Curriculum Developer with over a
              decade of experience. To date, I&apos;ve taught more than 6,000
              students across 18 countries and mentored winners of national and
              international competitions, including{" "}
              <span className="font-bold">
                the National BETA State Competition in Computer Science (2024
                &amp; 2025, U.S.)
              </span>{" "}
              and the{" "}
              <span className="font-bold">
                AI Challenge in Indonesia (2025)
              </span>
              . I&apos;m also one of the pioneers of robotics/STEM education in
              schools across Nigeria.
            </p>
            {/* links */}
            <div className="flex-wrap items-center justify-center gap-8 text-[#252323] font-lora font-semibold text-[20px] pt-6 space-y-4">
              <span className="w-fit h-6 flex items-center gap-2">
                <FileIcon />
                <Link href="/Sam-Eseyin-Resume.pdf" target="_blank">
                  <span className="flex flex-col">
                    Resume
                    <span className="border-b border-dashed border-[#FEFEFE] cursor-pointer"></span>
                  </span>
                </Link>
              </span>
              <span className="flex items-center gap-2">
                <LinkedIn />
                <Link
                  href="https://www.linkedin.com/in/sam-eseyin-125649143"
                  target="_blank"
                >
                  <span className="flex flex-col">
                    LinkedIn
                    <span className="border-b border-dashed border-[#FEFEFE] cursor-pointer"></span>
                  </span>
                </Link>
              </span>
              <span className="flex items-center gap-2">
                <OpenLetter />
                <Link href="mailto:sam@example.com" target="_blank">
                  <span className="flex flex-col">
                    Email
                    <span className="border-b border-dashed border-[#FEFEFE] cursor-pointer"></span>
                  </span>
                </Link>
              </span>
            </div>
          </div>
        </section>
        {/* (2) Standalone two-photos block */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <article>
            <div className="w-full grid grid-cols-1">
              <p className="font-lora font-normal text-[#252323] text-[16px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance] pl-10 text-left pr-2 py-[32px]">
                This photo captures the early days of my journey (2017-2024),
                during which we pioneered robotics and STEM education in FCT,
                Nigeria.
              </p>
              <div className="w-full">
                <div className="relative">
                  <span className="absolute top-2 left-1/4 text-[#EE4926] font-lora font-bold text-[14px]/[22px] tracking-normal">
                    Started 2017
                  </span>

                  <Image
                    src="/ideal-teachers.webp"
                    alt=""
                    width={200}
                    height={200}
                    priority
                    className="w-full"
                  />
                </div>
                <div className="relative">
                  <span className="absolute top-2 left-1/4 text-[#EE4926] font-lora font-bold text-[14px]/[22px] tracking-normal">
                    Failed 2024{" "}
                  </span>
                  <Image
                    src="/team-ideal.webp"
                    alt=""
                    width={200}
                    height={200}
                    priority
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <p className="w-fullfont-lora font-normal text-[#252323] text-[16px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance] pl-10 text-left pr-2 py-[32px] flex flex-col gap-8">
              <span>
                <span className="font-bold">My name is Sam Eseyin,</span> and in
                the 2000s, I was obsessed with robotics movies. They were my
                escape, sparking a deep curiosity about technology and
                engineering. By the next decade, that curiosity had grown into a
                full-blown passion. It pushed me to take bold steps, even when
                the odds seemed stacked against me.
              </span>
              <span>
                At the time, I was teaching kids chess in schools. I loved
                helping them develop strategic thinking, but I couldn&apos;t
                shake this thought:{" "}
                <span className="font-bold">
                  What if these kids could learn robotics instead?{" "}
                </span>{" "}
                The idea stuck with me, but there was a problem.
              </span>
            </p>
          </article>
        </div>
        {/* (2)the Chess players section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/student-chess-players.webp"
              alt=""
              fill
              className="object-cover object-top"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            In the environment I lived in,{" "}
            <span className="font-bold">
              (a small village (called Gbagalape on the outskirts of Abuja,
              Nigeria),{" "}
            </span>{" "}
            robotics was practically unheard of. Most kids had never even seen a
            robotics kit, let alone understood how to use one. But I
            couldn&apos;t let that stop me. I had to try. With no access to
            fancy kits or resources, I got creative. I downloaded schematics,
            and started pitching the idea to schools. I met with school owners
            and administrators, explaining how robotics could reshape the way
            kids think and learn. A few schools gave me a chance, and I stood in
            front of students and their parents with{" "}
            <span className="font-bold">
              nothing but printed papers in my hands.
            </span>
          </article>
        </div>
        {/* (3) three guys in red section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/three-friends-in red-shirts.webp"
              alt=""
              fill
              className="object-cover object-top"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            <span>
              The kids&apos; excitement was contagious. Their eyes lit up as I
              explained how robots worked, and I knew I had to do more. But
              there was one big problem: I didn&apos;t have a single robotics
              kit to show them. So, I did the only thing I could think of,{" "}
              <span className="font-bold">
                I sold the best pair of shoes I owned to scrape together enough
                money to order my first robotics kit,
              </span>{" "}
            </span>
            <span>
              When it finally arrived, I was overjoyed. I spent countless
              sleepless nights experimenting with it, learning everything I
              could. I was determined to master it so I could show kids what was
              possible.
            </span>
          </article>
        </div>
        {/* (4) Two guys standing in suite with Sam section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/sam-in-white-shirt.webp"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            <span>
              Confident in my new knowledge, I started touring schools in Abuja,
              demonstrating the kit&apos;s potential. The kids were amazed, and
              their excitement fueled me. That&apos;s when{" "}
              <span className="font-bold">Ideal Robotics</span> was born.
            </span>
            <span>
              Not long after, I met{" "}
              <span className="font-bold">Malik Gwandu, my co-founder</span> and
              one of the most passionate and kindest people I&apos;ve ever
              known. Together, we became a team on a mission. We went from
              school to school in Abuja, talking to anyone who would listen
              about STEM and robotics. We wanted kids to see what was possible
              to imagine a future where they could build, create, and solve
              problems.
            </span>
          </article>
        </div>
        {/* (5) Two guys standing in suite with Sam section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/sam-and-malik-in-red.webp"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            <span>
              Malik had this funny habit of saying,{" "}
              <span className="font-bold">
                &quot;Every time we walk into a supermarket, there&apos;s a 90%
                chance some kid will point at us and say, &apos;Hey, Mom,
                that&apos;s my robotics teacher!&quot;
              </span>
              And you know what? He was usually right. Those moments kept us
              going. After months of free workshops and school visits,{" "}
              <span className="font-bold">
                we finally got our first paying client, Lela Blossom School.{" "}
              </span>{" "}
              I&apos;ll never forget that feeling. It was like, &quot;Okay, this
              is real, we&apos;re really doing this.&quot;
            </span>
            <span>
              We were in demand, but with growth came new challenges. Schools
              paid us at the end of the term, and I didn’t have enough money to
              hire the team we needed.
            </span>
          </article>
        </div>
        {/* (6) Two guys standing in suite with Sam section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/robot-outdoor.webp"
              alt=""
              fill
              className="object-cover object-bottom"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            <span>
              I put out an ad, hoping someone would believe in what we were
              trying to do. And people did. A group of amazing people joined us,
              even though we couldn&apos;t promise much. We were paying each
              person just 50,000 Naira, it was all we could afford at the time.
              Malik and I weren&apos;t taking any pay; we poured everything back
              into the company.
            </span>
            <span>
              We rented a small office space with the little money we had. It
              was empty, with no chairs, no furniture, just a floor. Every
              morning, we&apos;d sit on that floor, plan our day, and then head
              out to schools to teach. I made a promise to my team: I would
              never owe them a salary.
            </span>
          </article>
        </div>
        {/* (7) Two guys standing in suite with Sam section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/ideal-teachers-on-the-floor.webp"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            <span>
              Shola, Queensley, Samuel, Victor, and Malik - these were the
              people who carried Ideal Robotics on their shoulders. They
              believed in the dream so much that they&pos;d bring me food from
              home when they knew I hadn&apos;t eaten. I&apos;ll never forget
              their kindness.
            </span>
            <span>
              During one of our toughest times, I reached out to Faiz Bashir,
              the founder of FlexiSAF, who generously provided us with funds
              that kept us going and truly saved us. As we continued to grow, so
              did our impact. School owners began referring us to their friends
              who also ran schools, often saying, “You have to see what these
              kids are building!”
            </span>
          </article>
        </div>
        {/* (8) Two guys standing in suite with Sam section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/sam-ideal-robotic-red-shirt-with-teacher.webp"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            <span>
              Parents joined in spreading the word, especially during summer
              camps, excited to share how their children were building robots,
              coding, designing mobile apps, and solving real-world problems.
              They wanted other kids to have the same empowering experience. It
              was inspiring to watch how word of mouth carried us forward.{" "}
            </span>
            <span>
              The biggest validation came when some of the schools we worked
              with began incorporating robotics into their curriculum. After
              seeing the impact it had on their students and how it sparked
              creativity, critical thinking, and problem-solving, they made it
              compulsory.
            </span>
          </article>
        </div>
        {/* (9) Two guys standing in suite with Sam section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/ideal-robotic-student-event.webp"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            <span>
              That was a huge win for us. What started as an extracurricular
              activity was now becoming a core part of education in some
              schools. We partnered with organizations like, Avion Innovation
              Hub, MTO Technologies, and the Discovery Museum to reach even more
              kids. During summer holidays, we ran intensive STEM and coding
              programs, teaching skills that many kids had never imagined.{" "}
            </span>
            <span>
              We also took them on excursions to various tech companies and
              organizations such as the National Center for Artificial
              Intelligence and Robotics, Flexisaf Edusoft.
            </span>
          </article>
        </div>
        {/* (10) Two guys standing in suite with Sam section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/ideal-robotic-students.webp"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            <span>
              <span className="font-bold">
                After eight years, Ideal Robotics had to shut down.
              </span>{" "}
              It was one of the toughest experience I&apos;ve had. Watching
              something I had built from scratch, something that touched so many
              lives, come to an end broke my heart. Closing the doors of Ideal
              Robotics was an incredibly difficult decision. Yet, through that
              setback, I found clarity.
            </span>
            <span>
              I realized that the impact we made on students, schools, and my
              team was only the beginning. I carry that same passion into this
              next chapter, working to empower even more young minds to dream,
              create, and innovate.
            </span>
          </article>
        </div>
        {/* (11) Two guys standing in suite with Sam section */}
        <div className="reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/hoodie-pair.webp"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>
          <article className="p-6 font-lora font-normal text-[#252323] text-[18px] leading-[32px] tracking-normal break-words hyphens-auto [text-wrap:balance]">
            <span>
              As I reflect on this journey, I am reminded of the people who
              stood by me, believed in me, and helped me keep going. My mom,
              whose unwavering support gave me the courage to dream big. My
              friend Sefater, who always encouraged me to keep pushing.
              Abdul-Malik, managing director of Cloud9, whose guidance and
              mentorship were invaluable, Mr. Thomas, and Samuel Kayode, whose
              friendship and support kept me grounded. To my team, Patience,
              Jessica, Keddy, Maxwell, Joes, Sushi, Florentina, Mildred,
              Chinedu, Chisom, my co-founder Malik, I am forever grateful.{" "}
              <span className="font-bold">
                The dream did not end; it evolved. And so will I.
              </span>
            </span>
          </article>
        </div>
        <div className="h-full reveal inline-grid flex-none overflow-hidden bg-[#ECE9E1]">
          <Image
            src="/team-ideal.webp"
            alt=""
            fill
            className="object-cover object-center"
          />
        </div>
      </div>
      {showHint && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-1/2 right-0 -translate-y-1/2 z-[100] pr-2"
        >
          <div className="flex items-center gap-2 rounded-l-lg bg-white px-4 py-2 text-[#252323] shadow-md border border-gray-200 animate-[fadeIn_500ms_ease-out]">
            {/* mouse icon with bouncing dot */}
            <div className="relative w-5 h-8 border-2 border-[#252323] rounded-full flex justify-center items-start overflow-hidden">
              <span className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#252323] animate-dotBounce" />
            </div>
            <span className="text-sm md:text-base font-medium whitespace-nowrap">
              {isMobile
                ? "Scroll down to see more"
                : "Scroll Your Mouse Please"}
            </span>
          </div>
        </div>
      )}
      {/* reveal CSS (GPU, smooth) */}
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translate3d(0, 16px, 0) scale(0.98);
          will-change: transform, opacity;
          transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
            opacity 0.6s ease;
        }
        .reveal.in {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
        /* Ensure wrapper is NOT a scroller; only the outer container scrolls */
        #wrapper {
          overflow: visible;
          white-space: normal;
        }
      `}</style>
    </main>
  )
}
