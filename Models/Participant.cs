using System.ComponentModel.DataAnnotations;

namespace Connect.Models
{
    public class Participant
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public DateTime JoinedAt { get; set; }

        public int MeetingId { get; set; }
        public Meeting Meeting { get; set; }
    }
}
