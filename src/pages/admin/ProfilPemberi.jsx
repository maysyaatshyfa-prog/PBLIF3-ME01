
import { User, Mail, Phone, MapPin, Edit } from "lucide-react";

const ProfilPemberi = () => {
  const profil = {
    nama: "Maysya Atshyfa Putri Widiyati",
    email: "maysya@gmail.com",
    telepon: "081234567890",
    alamat: "Batam, Kepulauan Riau",
  };

  return (
    <div className="profil-pemberi-page">
      <div className="profil-pemberi-header">
        <div>
          <h1>Profil Saya</h1>
          <p>Informasi akun pemberi zakat</p>
        </div>

        <button className="btn-edit-profil">
          <Edit size={16} />
          Edit Profil
        </button>
      </div>

      <div className="profil-pemberi-card">
        <div className="profil-pemberi-avatar">
          <User size={48} />
        </div>

        <h2>{profil.nama}</h2>
        <span className="profil-pemberi-role">
          Pemberi Zakat
        </span>

        <div className="profil-pemberi-info">
          <div className="profil-pemberi-item">
            <Mail size={20} />
            <div>
              <span>Email</span>
              <p>{profil.email}</p>
            </div>
          </div>

          <div className="profil-pemberi-item">
            <Phone size={20} />
            <div>
              <span>Nomor Telepon</span>
              <p>{profil.telepon}</p>
            </div>
          </div>

          <div className="profil-pemberi-item">
            <MapPin size={20} />
            <div>
              <span>Alamat</span>
              <p>{profil.alamat}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilPemberi;
