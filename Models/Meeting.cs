using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Connect.Models
{
    public class Meeting
    {
        public int Id { get; set; }

        [Required]
        public string RoomId { get; set; } = string.Empty;

        public DateTime StartedAt { get; set; }

        public DateTime EndedAt { get; set; }

        [Required]
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public IList<Participant> Participants { get; set; } = new List<Participant>();
    }
}
