const Contact = () => {
  return (
    <section id="contact" className="py-[100px] px-[5vw] bg-background">
      <div className="max-w-[680px] mx-auto">
        <div className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 flex items-center gap-3">
          <span className="block w-5 h-0.5 bg-primary" />
          Get in Touch
        </div>
        <h2 className="font-montserrat text-[clamp(2rem,4vw,3rem)] font-black text-foreground mb-2 tracking-tight uppercase">
          Connect <span className="font-dancing text-[1.4em] font-bold normal-case text-secondary tracking-normal">With Us</span>
        </h2>
        <p className="text-[15px] text-muted max-w-[600px] leading-[1.8]">
          Have a story to share? Want to partner with us or feature your church? We'd love to hear from you.
        </p>

        <form className="mt-12" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-primary mb-2 font-bold">Your Name</label>
              <input
                type="text"
                placeholder="Full name"
                className="w-full bg-primary/5 border border-primary/20 text-foreground font-montserrat text-sm px-4 py-3 outline-none focus:border-primary transition-colors placeholder:text-muted/40"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-primary mb-2 font-bold">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-primary/5 border border-primary/20 text-foreground font-montserrat text-sm px-4 py-3 outline-none focus:border-primary transition-colors placeholder:text-muted/40"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-primary mb-2 font-bold">Message</label>
            <textarea
              placeholder="Tell us about yourself or how you'd like to connect..."
              className="w-full bg-primary/5 border border-primary/20 text-foreground font-montserrat text-sm px-4 py-3 outline-none focus:border-primary transition-colors min-h-[130px] resize-y placeholder:text-muted/40"
            />
          </div>
          <div className="flex items-center gap-6 mt-2">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-9 py-3.5 text-[12px] font-bold tracking-[0.12em] uppercase border-none cursor-pointer hover:brightness-110 transition-all"
            >
              Send Message
            </button>
            <span className="text-[11px] text-muted">We'll respond within 24–48 hours</span>
          </div>
        </form>

        <div className="flex gap-4 mt-8">
          <a
            href="https://www.facebook.com/profile.php?id=100089467136337"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-primary/25 text-muted px-[18px] py-2.5 text-[12px] tracking-[0.08em] no-underline hover:border-primary hover:text-primary transition-all"
          >
            📘 Facebook
          </a>
          <a
            href="#"
            className="flex items-center gap-2 border border-primary/25 text-muted px-[18px] py-2.5 text-[12px] tracking-[0.08em] no-underline hover:border-primary hover:text-primary transition-all"
          >
            ✉️ Email Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
