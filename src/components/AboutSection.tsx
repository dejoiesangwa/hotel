import { useEffect, useState } from "react";
import { MapPin, Clock, Star, Phone } from "lucide-react";
import { hotelConfig } from "@/config/hotel";
import { supabase } from "@/integrations/supabase/client";

const AboutSection = () => {
  const [starRating, setStarRating] = useState<number>(hotelConfig.starRating);
  const [reviewScore, setReviewScore] = useState<number>(hotelConfig.reviewScore);
  const [reviewCount, setReviewCount] = useState<number>(hotelConfig.reviewCount);

  // Fetch editable ratings from the dashboard settings
  useEffect(() => {
    if (!hotelConfig.editableRatings) return;
    supabase
      .from("hotel_settings")
      .select("star_rating, review_score, review_count")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) return;
        if (typeof data.star_rating === "number") setStarRating(Number(data.star_rating));
        if (typeof data.review_score === "number") setReviewScore(Number(data.review_score));
        if (typeof data.review_count === "number") setReviewCount(Number(data.review_count));
      });
  }, []);

  const filledStars = Math.round(starRating);

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">About Us</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">{hotelConfig.fullName}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              {hotelConfig.about.paragraph1}
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              {hotelConfig.about.paragraph2}
            </p>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i <= filledStars ? "text-gold fill-gold" : "text-gold/40"}`}
                />
              ))}
              <span className="font-body text-sm text-muted-foreground ml-2">
                {reviewScore.toFixed(1)} / 5 ({reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {[
              { icon: MapPin, title: "Location", text: hotelConfig.address },
              { icon: Phone, title: "Phone", text: hotelConfig.phone },
              { icon: Clock, title: "Check-in", text: hotelConfig.checkInTime },
              { icon: Clock, title: "Check-out", text: hotelConfig.checkOutTime },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="font-body text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
